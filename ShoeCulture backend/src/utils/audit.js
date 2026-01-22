const AuditLog = require("../models/AuditLog");

const logAuditEvent = async ({ req, action, targetId = null, meta = {} }) => {
  try {
    await AuditLog.create({
      actorId: req.user?._id || null,
      action,
      targetId,
      meta,
      ip: req.ip || "",
      userAgent: req.get("user-agent") || "",
    });
  } catch (error) {
    // Avoid breaking auth flows if logging fails.
  }
};

module.exports = { logAuditEvent };
