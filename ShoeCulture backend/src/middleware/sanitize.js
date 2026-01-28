const xss = require("xss");

const EXEMPT_KEYS = new Set([
  "password",
  "currentPassword",
  "newPassword",
  "token",
  "captchaAnswer",
  "captchaToken",
]);

const isUnsafeKey = (key) => key.includes("$") || key.includes(".");

const sanitizeValue = (value, key = "") => {
  if (EXEMPT_KEYS.has(key)) {
    return value;
  }
  if (typeof value === "string") {
    return xss(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, val]) => [
        childKey,
        sanitizeValue(val, childKey),
      ])
    );
  }
  return value;
};

const sanitizeInput = (req, res, next) => {
  req.body = sanitizeValue(req.body);
  req.params = sanitizeValue(req.params);

  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      if (isUnsafeKey(key)) {
        delete req.body[key];
      }
    }
  }

  if (req.params && typeof req.params === "object") {
    for (const key of Object.keys(req.params)) {
      if (isUnsafeKey(key)) {
        delete req.params[key];
      }
    }
  }

  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      if (isUnsafeKey(key)) {
        delete req.query[key];
        continue;
      }
      req.query[key] = sanitizeValue(req.query[key], key);
    }
  }
  return next();
};

module.exports = { sanitizeInput };
