const Product = require("../models/Product");
const { logAuditEvent } = require("../utils/audit");

const parsePrice = (value) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue) || !Number.isFinite(numberValue)) {
    return null;
  }
  return numberValue;
};

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
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "Vault Street",
      description: "Everyday sneaker with durable grip and support.",
      price: 9800,
      imageUrl:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
    },
    {
      name: "Echo Court",
      description: "Retro inspired build with premium comfort.",
      price: 14200,
      imageUrl:
        "https://images.unsplash.com/photo-1542280756-74b2f55e73ab?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const created = await Product.insertMany(products);
  return res.status(201).json(created);
};

const createProduct = async (req, res) => {
  const { name, description, price, imageUrl = "" } = req.body || {};
  if (!name || !description || price === undefined) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const parsedPrice = parsePrice(price);
  if (parsedPrice === null || parsedPrice <= 0) {
    return res.status(400).json({ error: "Invalid price." });
  }

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required." });
  }

  const product = await Product.create({
    name: String(name).trim(),
    description: String(description).trim(),
    price: parsedPrice,
    imageUrl: String(imageUrl || "").trim(),
    isActive: true,
  });

  await logAuditEvent({
    req,
    action: "product.created",
    targetId: String(product._id),
  });

  return res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const { name, description, price, imageUrl, isActive } = req.body || {};
  const updates = {};

  if (name !== undefined) {
    updates.name = String(name).trim();
  }
  if (description !== undefined) {
    updates.description = String(description).trim();
  }
  if (price !== undefined) {
    const parsedPrice = parsePrice(price);
    if (parsedPrice === null || parsedPrice <= 0) {
      return res.status(400).json({ error: "Invalid price." });
    }
    updates.price = parsedPrice;
  }
  if (imageUrl !== undefined) {
    updates.imageUrl = String(imageUrl).trim();
  }
  if (isActive !== undefined) {
    updates.isActive = Boolean(isActive);
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  await logAuditEvent({
    req,
    action: "product.updated",
    targetId: String(product._id),
  });

  return res.json(product);
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  await logAuditEvent({
    req,
    action: "product.deleted",
    targetId: String(product._id),
  });

  return res.json({ message: "Product removed." });
};

module.exports = {
  listProducts,
  getProduct,
  seedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
