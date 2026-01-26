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
      imageUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='320'><rect width='100%25' height='100%25' fill='%23f2f2f2'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23555555' font-family='Arial' font-size='28'>Apex Runner</text></svg>",
    },
    {
      name: "Vault Street",
      description: "Everyday sneaker with durable grip and support.",
      price: 9800,
      imageUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='320'><rect width='100%25' height='100%25' fill='%23f2f2f2'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23555555' font-family='Arial' font-size='28'>Vault Street</text></svg>",
    },
    {
      name: "Echo Court",
      description: "Retro inspired build with premium comfort.",
      price: 14200,
      imageUrl:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='320'><rect width='100%25' height='100%25' fill='%23f2f2f2'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23555555' font-family='Arial' font-size='28'>Echo Court</text></svg>",
    },
  ];

  const created = await Product.insertMany(products);
  return res.status(201).json(created);
};

module.exports = { listProducts, getProduct, seedProducts };
