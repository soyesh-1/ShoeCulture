const { env } = require("../config/env");

const baseCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
  path: "/",
};

const getAuthCookieOptions = () => ({
  ...baseCookieOptions,
  maxAge: 2 * 60 * 60 * 1000,
});

const getClearCookieOptions = () => ({
  ...baseCookieOptions,
});

module.exports = { getAuthCookieOptions, getClearCookieOptions };
