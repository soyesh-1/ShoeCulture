const mongoose = require("mongoose");
const { env } = require("../src/config/env");
const User = require("../src/models/User");
const AuditLog = require("../src/models/AuditLog");

const run = async () => {
  if (!env.mongoUri) {
    console.error("MONGO_URI is missing.");
    process.exit(1);
  }

  await mongoose.connect(env.mongoUri);
  await User.deleteMany({});
  await AuditLog.deleteMany({});
  console.log("Cleared users and audit logs.");
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Clear auth failed:", error.message || error);
  process.exit(1);
});
