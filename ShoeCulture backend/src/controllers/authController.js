const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const { env } = require("../config/env");
const { validatePassword, HISTORY_LIMIT } = require("../utils/passwordPolicy");
const { addMinutes, addDays, generateOtp, hashToken } = require("../utils/tokens");
const { getAuthCookieOptions, getClearCookieOptions } = require("../utils/cookies");
const { logAuditEvent } = require("../utils/audit");
const { sendEmail } = require("../utils/mailer");

const emailSchema = z.string().email();

const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const verifyEmailSchema = z.object({
  email: emailSchema,
  token: z.string().min(6).max(6),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  captchaToken: z.string().optional(),
  captchaAnswer: z.string().optional(),
});

const issueJwt = (userId) => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is missing.");
  }
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

const createCaptcha = () => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is missing.");
  }
  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 8) + 2;
  const token = jwt.sign({ left, right }, env.jwtSecret, {
    expiresIn: `${env.captchaTtlMinutes}m`,
  });
  return { challenge: `${left} + ${right}`, token };
};

const verifyCaptcha = (token, answer) => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is missing.");
  }
  const payload = jwt.verify(token, env.jwtSecret);
  const expected = Number(payload.left) + Number(payload.right);
  return Number(answer) === expected;
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
    await sendLockoutEmail({ email: user.email, reason: "login" });
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

const isPasswordExpired = (user) => {
  if (!user.passwordExpiresAt) {
    return false;
  }
  return user.passwordExpiresAt.getTime() < Date.now();
};

const isMfaLockedOut = (user) => {
  if (!user.mfaLockoutUntil) {
    return false;
  }
  return user.mfaLockoutUntil.getTime() > Date.now();
};

const bumpFailedMfa = async (user) => {
  user.mfaFailedAttempts += 1;
  if (user.mfaFailedAttempts >= 5) {
    user.mfaLockoutUntil = addMinutes(15);
    await sendLockoutEmail({ email: user.email, reason: "verification" });
  }
  await user.save();
};

const resetMfaLockout = async (user) => {
  user.mfaFailedAttempts = 0;
  user.mfaLockoutUntil = null;
  await user.save();
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

const sendLockoutEmail = async ({ email, reason }) => {
  if (env.otpFallbackToLog) {
    console.log(`[LOCKOUT] ${email}: ${reason}`);
    return;
  }
  await sendEmail({
    to: email,
    subject: "ShoeCulture security notice",
    text: `We detected multiple failed ${reason} attempts on your account. Access is temporarily locked for 15 minutes.`,
  });
};

const sendVerificationEmail = async ({ email, otp }) => {
  if (env.otpFallbackToLog) {
    console.log(`[VERIFY] ${email}: ${otp}`);
    return;
  }
  await sendEmail({
    to: email,
    subject: "Verify your ShoeCulture email",
    text: `Your email verification code is ${otp}. It expires in 15 minutes.`,
  });
};

const issueEmailVerification = async (user) => {
  const otp = generateOtp();
  user.emailVerificationTokenHash = hashToken(otp);
  user.emailVerificationExpiresAt = addMinutes(15);
  await user.save();
  await sendVerificationEmail({ email: user.email, otp });
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
  const passwordExpiresAt = addDays(env.passwordExpiresDays);
  const user = await User.create({
    email,
    passwordHash,
    passwordHistory: [{ hash: passwordHash, changedAt: new Date() }],
    passwordChangedAt: new Date(),
    passwordExpiresAt,
    isEmailVerified: false,
  });

  await issueEmailVerification(user);

  await logAuditEvent({
    req,
    action: "auth.register",
    targetId: String(user._id),
  });

  return res.status(201).json({
    message: "Registration successful. Verify your email.",
  });
};

const getCaptcha = async (req, res) => {
  if (!env.captchaRequired) {
    return res.json({ required: false });
  }
  const { challenge, token } = createCaptcha();
  return res.json({ required: true, challenge, token });
};

const verifyEmail = async (req, res) => {
  const parsed = verifyEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const { email, token } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Invalid code." });
  }

  if (user.isEmailVerified) {
    return res.json({ message: "Email already verified." });
  }

  if (
    !user.emailVerificationTokenHash ||
    !user.emailVerificationExpiresAt ||
    user.emailVerificationExpiresAt.getTime() < Date.now()
  ) {
    return res.status(400).json({ error: "Verification code expired." });
  }

  const expectedHash = hashToken(token);
  if (expectedHash !== user.emailVerificationTokenHash) {
    return res.status(400).json({ error: "Invalid code." });
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpiresAt = null;
  await user.save();

  await logAuditEvent({
    req,
    action: "auth.email_verified",
    targetId: String(user._id),
  });

  return res.json({ message: "Email verified." });
};

const resendVerification = async (req, res) => {
  const parsed = z
    .object({ email: emailSchema })
    .safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const { email } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Invalid email." });
  }

  if (user.isEmailVerified) {
    return res.json({ message: "Email already verified." });
  }

  await issueEmailVerification(user);

  await logAuditEvent({
    req,
    action: "auth.email_verification_resent",
    targetId: String(user._id),
  });

  return res.json({ message: "Verification code sent." });
};

const login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const { email, password, captchaToken, captchaAnswer } = parsed.data;
  if (env.captchaRequired) {
    if (!captchaToken || !captchaAnswer) {
      return res.status(400).json({ error: "Captcha is required." });
    }
    try {
      const ok = verifyCaptcha(captchaToken, captchaAnswer);
      if (!ok) {
        await logAuditEvent({
          req,
          action: "auth.captcha_failed",
          meta: { email },
        });
        return res.status(400).json({ error: "Captcha failed." });
      }
    } catch (error) {
      return res.status(400).json({ error: "Captcha expired." });
    }
  }
  const user = await User.findOne({ email });
  if (!user) {
    await logAuditEvent({ req, action: "auth.login_failed", meta: { email } });
    return res.status(401).json({ error: "Invalid credentials." });
  }

  if (isLockedOut(user)) {
    await logAuditEvent({
      req,
      action: "auth.login_locked",
      targetId: String(user._id),
    });
    return res.status(423).json({ error: "Account locked. Try later." });
  }

  if (!user.isEmailVerified) {
    await issueEmailVerification(user);
    return res.json({
      message: "Email not verified.",
      verificationRequired: true,
    });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await bumpFailedLogin(user);
    await logAuditEvent({
      req,
      action: "auth.login_failed",
      targetId: String(user._id),
    });
    return res.status(401).json({ error: "Invalid credentials." });
  }

  await resetLockout(user);

  if (!user.passwordExpiresAt) {
    user.passwordExpiresAt = addDays(env.passwordExpiresDays);
    await user.save();
  }

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
  if (!user) {
    return res.status(400).json({ error: "Invalid code." });
  }

  if (isMfaLockedOut(user)) {
    await logAuditEvent({
      req,
      action: "auth.mfa_locked",
      targetId: String(user._id),
    });
    return res.status(423).json({ error: "Too many attempts. Try later." });
  }

  if (!user.mfaOtpHash || !user.mfaOtpExpiresAt) {
    await bumpFailedMfa(user);
    await logAuditEvent({
      req,
      action: "auth.mfa_failed",
      targetId: String(user._id),
      meta: { reason: "otp_missing" },
    });
    return res.status(400).json({ error: "Invalid code." });
  }

  if (user.mfaOtpExpiresAt.getTime() < Date.now()) {
    await bumpFailedMfa(user);
    await logAuditEvent({
      req,
      action: "auth.mfa_failed",
      targetId: String(user._id),
      meta: { reason: "otp_expired" },
    });
    return res.status(400).json({ error: "OTP expired." });
  }

  const expectedHash = hashToken(otpToken);
  if (expectedHash !== user.mfaOtpHash) {
    await bumpFailedMfa(user);
    await logAuditEvent({
      req,
      action: "auth.mfa_failed",
      targetId: String(user._id),
      meta: { reason: "otp_invalid" },
    });
    return res.status(400).json({ error: "Invalid code." });
  }

  const previousLoginIp = user.lastLoginIp || "";
  const previousAgent = user.lastLoginAgent || "";

  user.mfaOtpHash = null;
  user.mfaOtpExpiresAt = null;
  user.lastLoginAt = new Date();
  user.lastLoginIp = req.ip || "";
  user.lastLoginAgent = req.get("user-agent") || "";
  await resetMfaLockout(user);
  await user.save();

  if (
    (previousLoginIp && previousLoginIp !== user.lastLoginIp) ||
    (previousAgent && previousAgent !== user.lastLoginAgent)
  ) {
    await logAuditEvent({
      req,
      action: "auth.login_device_change",
      targetId: String(user._id),
      meta: {
        previousLoginIp,
        previousAgent,
        currentLoginIp: user.lastLoginIp,
        currentAgent: user.lastLoginAgent,
      },
    });
  }

  const authToken = issueJwt(user._id.toString());
  res.cookie("auth", authToken, getAuthCookieOptions());

  await logAuditEvent({
    req,
    action: "auth.login_success",
    targetId: String(user._id),
  });

  const passwordExpired = isPasswordExpired(user);
  if (passwordExpired) {
    await logAuditEvent({
      req,
      action: "auth.password_expired",
      targetId: String(user._id),
    });
  }
  return res.json({
    message: passwordExpired ? "Password expired." : "Login successful.",
    passwordExpired,
    user: { id: user._id, email: user.email, role: user.role },
  });
};

const logout = async (req, res) => {
  res.clearCookie("auth", getClearCookieOptions());
  res.clearCookie("csrf", getClearCookieOptions());
  return res.json({ message: "Logged out." });
};

module.exports = {
  register,
  getCaptcha,
  verifyEmail,
  resendVerification,
  login,
  verifyMfa,
  logout,
};
