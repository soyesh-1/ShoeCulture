const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const { env } = require("./config/env");
const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/auth");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = { app };
