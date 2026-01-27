const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const { env } = require("../config/env");
const { validatePassword, HISTORY_LIMIT } = require("../utils/passwordPolicy");
const { addMinutes } = require("../utils/tokens");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { getAuthCookieOptions } = require("../utils/cookies");
const { logAuditEvent } = require("../utils/audit");

const emailSchema = z.string().email();

const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const totpSchema = z.object({
  token: z.string().min(6).max(6),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const issueJwt = (userId) => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is missing.");
  }
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

const createTotpSecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `${env.totpIssuer} (${email})`,
  });
  return secret;
};

const isLockedOut = (user) => {
  if (!user.lockoutUntil) {
    return false;
  }
  return user.lockoutUntil.getTime() > Date.now();
};

const bumpFailedLogin = async (user) => {
  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= 5) {
    user.lockoutUntil = addMinutes(15);
  }
  await user.save();
};

const resetLockout = async (user) => {
  user.failedLoginAttempts = 0;
  user.lockoutUntil = null;
  await user.save();
};

const updatePasswordHistory = (user, currentHash) => {
  if (!currentHash) {
    return;
  }
  user.passwordHistory.unshift({
    hash: currentHash,
    changedAt: new Date(),
  });
  user.passwordHistory = user.passwordHistory.slice(0, HISTORY_LIMIT);
};

const register = async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const { email, password } = parsed.data;
  const policy = validatePassword(password);
  if (!policy.valid) {
    return res.status(400).json({ error: policy.errors });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "Email already registered." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    passwordHash,
    passwordHistory: [{ hash: passwordHash, changedAt: new Date() }],
  });

  const authToken = issueJwt(user._id.toString());
  res.cookie("auth", authToken, getAuthCookieOptions());

  await logAuditEvent({
    req,
    action: "auth.register",
    targetId: String(user._id),
  });

  return res.status(201).json({
    message: "Registration successful. Set up your authenticator app.",
  });
};

const setupTotp = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const secret = createTotpSecret(user.email);
  user.totpSecret = secret.base32;
  await user.save();

  const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
  return res.json({
    qrCode: qrDataUrl,
    secret: secret.base32,
  });
};

const verifyTotpSetup = async (req, res) => {
  const parsed = totpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const user = await User.findById(req.user._id);
  if (!user || !user.totpSecret) {
    return res.status(400).json({ error: "TOTP is not initialized." });
  }

  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: "base32",
    token: parsed.data.token,
    window: 1,
  });

  if (!verified) {
    return res.status(400).json({ error: "Invalid code." });
  }

  user.totpEnabled = true;
  await user.save();

  await logAuditEvent({
    req,
    action: "auth.totp_enabled",
    targetId: String(user._id),
  });

  return res.json({ message: "Authenticator enabled." });
};

const login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  if (isLockedOut(user)) {
    return res.status(423).json({ error: "Account locked. Try later." });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await bumpFailedLogin(user);
    return res.status(401).json({ error: "Invalid credentials." });
  }

  await resetLockout(user);

  if (!user.totpEnabled) {
    return res.json({ message: "TOTP setup required.", setupRequired: true });
  }

  return res.json({ message: "TOTP required.", mfaRequired: true });
};

const verifyMfa = async (req, res) => {
  const parsed = z
    .object({
      email: emailSchema,
      token: z.string().min(6).max(6),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const { email, token: totpToken } = parsed.data;
  const user = await User.findOne({ email });
  if (!user || !user.totpSecret) {
    return res.status(400).json({ error: "Invalid code." });
  }

  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: "base32",
    token: totpToken,
    window: 1,
  });

  if (!verified) {
    return res.status(400).json({ error: "Invalid code." });
  }

  const authToken = issueJwt(user._id.toString());
  res.cookie("auth", authToken, getAuthCookieOptions());

  await logAuditEvent({
    req,
    action: "auth.login_success",
    targetId: String(user._id),
  });

  return res.json({
    message: "Login successful.",
    user: { id: user._id, email: user.email, role: user.role },
  });
};

const logout = async (req, res) => {
  res.clearCookie("auth");
  return res.json({ message: "Logged out." });
};

module.exports = {
  register,
  setupTotp,
  verifyTotpSetup,
  login,
  verifyMfa,
  logout,
};
