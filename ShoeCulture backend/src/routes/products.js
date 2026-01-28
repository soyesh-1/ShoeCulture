const express = require("express");
const {
  listProducts,
  getProduct,
  seedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

const router = express.Router();

router.get("/", listProducts);
router.post("/", requireAuth, requireRole(["admin"]), createProduct);
router.put("/:id", requireAuth, requireRole(["admin"]), updateProduct);
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteProduct);
router.post("/seed", seedProducts);
router.get("/:id", getProduct);

module.exports = router;
