const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  verifyEmail,
  resendVerification,
  login,
  verifyMfa,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/verify-email/resend", authLimiter, resendVerification);
router.post("/login", authLimiter, login);
router.post("/mfa/verify", authLimiter, verifyMfa);
router.post("/logout", logout);
router.post("/password/forgot", authLimiter, forgotPassword);
router.post("/password/reset", authLimiter, resetPassword);
router.post("/password/change", requireAuth, changePassword);

module.exports = router;
