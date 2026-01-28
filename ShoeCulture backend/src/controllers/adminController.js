const AuditLog = require("../models/AuditLog");

const listAuditLogs = async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(),
  ]);

  return res.json({
    page,
    limit,
    total,
    items,
  });
};

module.exports = { listAuditLogs };
