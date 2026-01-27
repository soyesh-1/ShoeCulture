const { env } = require("../config/env");

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "none",
  maxAge: 2 * 60 * 60 * 1000,
});

module.exports = { getAuthCookieOptions };
