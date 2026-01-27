const express = require("express");
const {
  listProducts,
  getProduct,
  seedProducts,
  createProduct,
} = require("../controllers/productController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

const router = express.Router();

router.get("/", listProducts);
router.post("/", requireAuth, requireRole(["admin"]), createProduct);
router.post("/seed", seedProducts);
router.get("/:id", getProduct);

module.exports = router;
