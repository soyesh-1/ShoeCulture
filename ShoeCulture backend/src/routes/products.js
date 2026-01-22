const express = require("express");
const {
  listProducts,
  getProduct,
  seedProducts,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", listProducts);
router.post("/seed", seedProducts);
router.get("/:id", getProduct);

module.exports = router;
