const Stripe = require("stripe");
const { z } = require("zod");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { env } = require("../config/env");

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    })
  ),
});

const createCheckoutSession = async (req, res) => {
  if (!env.stripeSecretKey) {
    return res.status(500).json({ error: "Stripe is not configured." });
  }

  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid cart data." });
  }

  const stripe = new Stripe(env.stripeSecretKey);
  const { items } = parsed.data;
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });

  if (products.length === 0) {
    return res.status(400).json({ error: "No valid products found." });
  }

  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const lineItems = items
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        return null;
      }
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      };
    })
    .filter(Boolean);

  if (lineItems.length === 0) {
    return res.status(400).json({ error: "No valid items to checkout." });
  }

  const total = lineItems.reduce(
    (sum, item) => sum + item.price_data.unit_amount * item.quantity,
    0
  );

  const orderItems = items
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        return null;
      }
      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    })
    .filter(Boolean);

  const order = await Order.create({
    userId: req.user?._id || null,
    items: orderItems,
    total,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${env.frontendUrl}/dashboard/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.frontendUrl}/cart?canceled=true`,
    metadata: {
      orderId: String(order._id),
      userId: req.user?._id ? String(req.user._id) : "guest",
    },
  });

  order.stripeSessionId = session.id;
  await order.save();

  return res.json({ url: session.url });
};

module.exports = { createCheckoutSession };
