const Product = require("../models/Product");

const listProducts = async (req, res) => {
  const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
  return res.json(products);
};

const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) {
    return res.status(404).json({ error: "Product not found." });
  }
  return res.json(product);
};

const seedProducts = async (req, res) => {
  const existing = await Product.countDocuments();
  if (existing > 0) {
    return res.status(409).json({ error: "Products already exist." });
  }

  const products = [
    {
      name: "Apex Runner",
      description: "Lightweight performance shoe for daily runs.",
      price: 12500,
      imageUrl: "",
    },
    {
      name: "Vault Street",
      description: "Everyday sneaker with durable grip and support.",
      price: 9800,
      imageUrl: "",
    },
    {
      name: "Echo Court",
      description: "Retro inspired build with premium comfort.",
      price: 14200,
      imageUrl: "",
    },
  ];

  const created = await Product.insertMany(products);
  return res.status(201).json(created);
};

module.exports = { listProducts, getProduct, seedProducts };
