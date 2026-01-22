const mongoose = require("mongoose");
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

    app.listen(env.port, () => {
      console.log(`ShoeCulture API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

startServer();
