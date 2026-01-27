const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  setupTotp,
  verifyTotpSetup,
  login,
  verifyMfa,
  logout,
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
router.post("/login", authLimiter, login);
router.post("/mfa/verify", authLimiter, verifyMfa);
router.post("/logout", logout);
router.post("/totp/setup", requireAuth, setupTotp);
router.post("/totp/verify", requireAuth, verifyTotpSetup);

module.exports = router;
