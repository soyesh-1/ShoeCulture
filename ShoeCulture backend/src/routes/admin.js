const express = require("express");
const { listAuditLogs } = require("../controllers/adminController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

const router = express.Router();

router.get("/audit", requireAuth, requireRole(["admin"]), listAuditLogs);

module.exports = router;
