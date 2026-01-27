const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const { env } = require("../config/env");
const { validatePassword, HISTORY_LIMIT } = require("../utils/passwordPolicy");
const { addMinutes, generateOtp, hashToken } = require("../utils/tokens");
const { getAuthCookieOptions } = require("../utils/cookies");
const { logAuditEvent } = require("../utils/audit");
const { sendEmail } = require("../utils/mailer");

const emailSchema = z.string().email();

const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
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

const sendOtpEmail = async ({ email, otp }) => {
  if (env.otpFallbackToLog) {
    console.log(`[OTP] ${email}: ${otp}`);
    return;
  }
  await sendEmail({
    to: email,
    subject: "Your ShoeCulture login code",
    text: `Your one-time login code is ${otp}. It expires in 10 minutes.`,
  });
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

  const otp = generateOtp();
  user.mfaOtpHash = hashToken(otp);
  user.mfaOtpExpiresAt = addMinutes(10);
  await user.save();

  await sendOtpEmail({ email: user.email, otp });

  return res.json({ message: "OTP sent.", mfaRequired: true });
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

  const { email, token: otpToken } = parsed.data;
  const user = await User.findOne({ email });
  if (!user || !user.mfaOtpHash || !user.mfaOtpExpiresAt) {
    return res.status(400).json({ error: "Invalid code." });
  }

  if (user.mfaOtpExpiresAt.getTime() < Date.now()) {
    return res.status(400).json({ error: "OTP expired." });
  }

  const expectedHash = hashToken(otpToken);
  if (expectedHash !== user.mfaOtpHash) {
    return res.status(400).json({ error: "Invalid code." });
  }

  user.mfaOtpHash = null;
  user.mfaOtpExpiresAt = null;
  await user.save();

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
  login,
  verifyMfa,
  logout,
};
