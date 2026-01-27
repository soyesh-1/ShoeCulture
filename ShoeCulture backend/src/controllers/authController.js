const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const { env } = require("../config/env");
const { validatePassword, HISTORY_LIMIT } = require("../utils/passwordPolicy");
const { generateOtp, hashToken, addMinutes } = require("../utils/tokens");
const { sendEmail } = require("../utils/mailer");
const { getAuthCookieOptions } = require("../utils/cookies");
const { logAuditEvent } = require("../utils/audit");

const emailSchema = z.string().email();

const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const verifySchema = z.object({
  email: emailSchema,
  otp: z.string().min(6).max(6),
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

const sendOtpEmail = async ({ email, otp, subject, otpType, expiresInMinutes }) => {
  try {
    const info = await sendEmail({
      to: email,
      subject,
      text: `Your ${otpType} code is ${otp}. It expires in ${expiresInMinutes} minutes.`,
    });
    if (info?.accepted?.length) {
      console.log(`[OTP:${otpType}] sent to ${info.accepted.join(", ")}`);
    }
  } catch (error) {
    console.error(`[OTP:${otpType}] email send failed`, error.message || error);
    if (env.otpFallbackToLog) {
      console.warn(`[OTP:${otpType}] ${email} -> ${otp}`);
      return;
    }
    throw error;
  }
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
  const otp = generateOtp();
  const otpHash = hashToken(otp);

  const user = await User.create({
    email,
    passwordHash,
    emailVerificationTokenHash: otpHash,
    emailVerificationExpiresAt: addMinutes(15),
    passwordHistory: [{ hash: passwordHash, changedAt: new Date() }],
  });

  await sendOtpEmail({
    email,
    otp,
    subject: "Verify your ShoeCulture account",
    otpType: "verification",
    expiresInMinutes: 15,
  });

  await logAuditEvent({
    req,
    action: "auth.register",
    targetId: String(user._id),
  });

  return res.status(201).json({
    message: "Registration successful. Check your email for the OTP.",
  });
};

const verifyEmail = async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const { email, otp } = parsed.data;
  const user = await User.findOne({ email });
  if (!user || !user.emailVerificationTokenHash) {
    return res.status(400).json({ error: "Invalid OTP." });
  }

  if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
    return res.status(400).json({ error: "OTP expired." });
  }

  const otpHash = hashToken(otp);
  if (otpHash !== user.emailVerificationTokenHash) {
    return res.status(400).json({ error: "Invalid OTP." });
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpiresAt = null;
  await user.save();

  await logAuditEvent({
    req,
    action: "auth.verify_email",
    targetId: String(user._id),
  });

  return res.json({ message: "Email verified." });
};

const resendVerification = async (req, res) => {
  const parsed = z.object({ email: emailSchema }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const { email } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "If the account exists, an OTP was sent." });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ error: "Email already verified." });
  }

  const otp = generateOtp();
  user.emailVerificationTokenHash = hashToken(otp);
  user.emailVerificationExpiresAt = addMinutes(15);
  await user.save();

  await sendOtpEmail({
    email,
    otp,
    subject: "Verify your ShoeCulture account",
    otpType: "verification",
    expiresInMinutes: 15,
  });

  return res.json({ message: "Verification OTP resent." });
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

  if (!user.isEmailVerified) {
    return res.status(403).json({ error: "Email not verified." });
  }

  await resetLockout(user);

  const otp = generateOtp();
  user.mfaOtpHash = hashToken(otp);
  user.mfaOtpExpiresAt = addMinutes(10);
  await user.save();

  await sendOtpEmail({
    email: user.email,
    otp,
    subject: "Your ShoeCulture login OTP",
    otpType: "login",
    expiresInMinutes: 10,
  });

  await logAuditEvent({
    req,
    action: "auth.login_mfa_sent",
    targetId: String(user._id),
  });

  return res.json({ message: "OTP sent.", mfaRequired: true });
};

const verifyMfa = async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const { email, otp } = parsed.data;
  const user = await User.findOne({ email });
  if (!user || !user.mfaOtpHash) {
    return res.status(400).json({ error: "Invalid OTP." });
  }

  if (!user.mfaOtpExpiresAt || user.mfaOtpExpiresAt < new Date()) {
    return res.status(400).json({ error: "OTP expired." });
  }

  const otpHash = hashToken(otp);
  if (otpHash !== user.mfaOtpHash) {
    return res.status(400).json({ error: "Invalid OTP." });
  }

  user.mfaOtpHash = null;
  user.mfaOtpExpiresAt = null;
  await user.save();

  const token = issueJwt(user._id.toString());
  res.cookie("auth", token, getAuthCookieOptions());

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
  verifyEmail,
  resendVerification,
  login,
  verifyMfa,
  logout,
};
