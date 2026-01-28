const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { app } = require("./app");
const { env } = require("./config/env");

const startServer = async () => {
  if (!env.mongoUri) {
    console.error("MONGO_URI is missing. Check your .env file.");
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected");

    const useHttps = process.env.HTTPS_ENABLED === "true";
    if (useHttps) {
      const keyPath = process.env.HTTPS_KEY_PATH || "";
      const certPath = process.env.HTTPS_CERT_PATH || "";
      const key = fs.readFileSync(path.resolve(keyPath));
      const cert = fs.readFileSync(path.resolve(certPath));
      https.createServer({ key, cert }, app).listen(env.port, () => {
        console.log(`ShoeCulture API listening on https://localhost:${env.port}`);
      });
    } else {
      http.createServer(app).listen(env.port, () => {
        console.log(`ShoeCulture API listening on http://localhost:${env.port}`);
      });
    }
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

startServer();
