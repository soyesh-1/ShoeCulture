const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

const createCsrfToken = () => {
  const raw = crypto.randomBytes(32).toString("hex");
  const signed = jwt.sign({ token: raw }, env.jwtSecret, {
    expiresIn: `${env.csrfTtlMinutes}m`,
  });
  return { raw, signed };
};

const verifyCsrfToken = (signed, raw) => {
  const payload = jwt.verify(signed, env.jwtSecret);
  return payload.token === raw;
};

const csrfGuard = (req, res, next) => {
  const unsafeMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!unsafeMethods.includes(req.method)) {
    return next();
  }
  const exemptPaths = [
    "/api/v1/auth/logout",
    "/api/v1/security/csrf",
  ];
  if (exemptPaths.some((path) => req.originalUrl.startsWith(path))) {
    return next();
  }
  const headerToken = req.get("x-csrf-token");
  const cookieToken = req.cookies?.csrf;
  if (!headerToken || !cookieToken) {
    return res.status(403).json({ error: "Invalid CSRF token." });
  }
  try {
    const ok = verifyCsrfToken(cookieToken, headerToken);
    if (!ok) {
      return res.status(403).json({ error: "Invalid CSRF token." });
    }
  } catch (error) {
    return res.status(403).json({ error: "Invalid CSRF token." });
  }
  return next();
};

module.exports = { createCsrfToken, csrfGuard };
