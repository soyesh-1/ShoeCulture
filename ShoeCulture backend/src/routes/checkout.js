const express = require("express");
const rateLimit = require("express-rate-limit");
const { createCheckoutSession } = require("../controllers/checkoutController");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.post("/", requireAuth, checkoutLimiter, createCheckoutSession);

module.exports = router;
