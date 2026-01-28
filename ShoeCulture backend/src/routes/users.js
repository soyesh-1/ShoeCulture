const express = require("express");
const rateLimit = require("express-rate-limit");
const { getMe, changePassword, updateProfile } = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.get("/me", requireAuth, getMe);
router.post("/password", requireAuth, passwordLimiter, changePassword);
router.post("/profile", requireAuth, updateProfile);

module.exports = router;
