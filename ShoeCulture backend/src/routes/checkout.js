const express = require("express");
const { createCheckoutSession } = require("../controllers/checkoutController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, createCheckoutSession);

module.exports = router;
