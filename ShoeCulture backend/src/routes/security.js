const express = require("express");
const { createCsrfToken } = require("../middleware/csrf");
const { env } = require("../config/env");

const router = express.Router();

router.get("/csrf", (req, res) => {
  const { raw, signed } = createCsrfToken();
  res.cookie("csrf", signed, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    maxAge: env.csrfTtlMinutes * 60 * 1000,
  });
  return res.json({ token: raw });
});

module.exports = router;
