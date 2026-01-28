const mongoose = require("mongoose");

const passwordHistorySchema = new mongoose.Schema(
  {
    hash: { type: String, required: true },
    changedAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["buyer", "admin"],
      default: "buyer",
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, default: null },
    emailVerificationExpiresAt: { type: Date, default: null },
    mfaOtpHash: { type: String, default: null },
    mfaOtpExpiresAt: { type: Date, default: null },
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },
    passwordHistory: { type: [passwordHistorySchema], default: [] },
    passwordChangedAt: { type: Date, default: Date.now },
    passwordExpiresAt: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date, default: null },
    mfaFailedAttempts: { type: Number, default: 0 },
    mfaLockoutUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: "" },
    lastLoginAgent: { type: String, default: "" },
    profileNameEnc: { type: String, default: "" },
    profilePhoneEnc: { type: String, default: "" },
    profileAddressEnc: { type: String, default: "" },
    profileDobEnc: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
