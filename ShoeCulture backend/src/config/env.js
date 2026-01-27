const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), ".env") });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "",
  smtpTimeoutMs: Number(process.env.SMTP_TIMEOUT_MS || 8000),
  otpFallbackToLog: process.env.OTP_FALLBACK_TO_LOG === "true",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  totpIssuer: process.env.TOTP_ISSUER || "ShoeCulture",
};

module.exports = { env };
