const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  getCaptcha,
  verifyEmail,
  resendVerification,
  login,
  verifyMfa,
  logout,
} = require("../controllers/authController");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const mfaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.get("/captcha", getCaptcha);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/verify-email/resend", authLimiter, resendVerification);
router.post("/login", loginLimiter, login);
router.post("/mfa/verify", mfaLimiter, verifyMfa);
router.post("/logout", logout);

module.exports = router;
