const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.auth;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (user.passwordExpiresAt && user.passwordExpiresAt.getTime() < Date.now()) {
      const allowed = [
        "/api/v1/users/password",
        "/api/v1/users/me",
        "/api/v1/auth/logout",
      ];
      const isAllowed = allowed.some((path) => req.originalUrl.startsWith(path));
      if (!isAllowed) {
        return res
          .status(403)
          .json({ error: "Password expired.", passwordExpired: true });
      }
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = { requireAuth };
