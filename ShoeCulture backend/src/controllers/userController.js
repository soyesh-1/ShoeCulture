const bcrypt = require("bcrypt");
const { z } = require("zod");
const { env } = require("../config/env");
const User = require("../models/User");
const { addDays } = require("../utils/tokens");
const { validatePassword, HISTORY_LIMIT } = require("../utils/passwordPolicy");
const { logAuditEvent } = require("../utils/audit");
const { encryptField, decryptField } = require("../utils/crypto");

const getMe = async (req, res) => {
  return res.json({
    id: req.user._id,
    email: req.user.email,
    role: req.user.role,
    createdAt: req.user.createdAt,
    passwordChangedAt: req.user.passwordChangedAt,
    passwordExpiresAt: req.user.passwordExpiresAt,
    isEmailVerified: req.user.isEmailVerified,
    profile: {
      name: decryptField(req.user.profileNameEnc),
      phone: decryptField(req.user.profilePhoneEnc),
      address: decryptField(req.user.profileAddressEnc),
      dob: decryptField(req.user.profileDobEnc),
    },
  });
};

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

const profileSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  phone: z.string().min(3).max(30).optional(),
  address: z.string().min(3).max(160).optional(),
  dob: z.string().min(4).max(20).optional(),
});

const updatePasswordHistory = (user, currentHash) => {
  if (!currentHash) {
    return;
  }
  user.passwordHistory.unshift({
    hash: currentHash,
    changedAt: new Date(),
  });
  user.passwordHistory = user.passwordHistory.slice(0, HISTORY_LIMIT);
};

const isPasswordReused = async (newPassword, user) => {
  if (await bcrypt.compare(newPassword, user.passwordHash)) {
    return true;
  }
  for (const entry of user.passwordHistory || []) {
    if (await bcrypt.compare(newPassword, entry.hash)) {
      return true;
    }
  }
  return false;
};

const changePassword = async (req, res) => {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const { currentPassword, newPassword } = parsed.data;
  const policy = validatePassword(newPassword);
  if (!policy.valid) {
    return res.status(400).json({ error: policy.errors });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    await logAuditEvent({
      req,
      action: "auth.password_change_failed",
      targetId: String(user._id),
    });
    return res.status(401).json({ error: "Current password is incorrect." });
  }

  const reused = await isPasswordReused(newPassword, user);
  if (reused) {
    return res
      .status(400)
      .json({ error: "Password was used recently. Choose a new one." });
  }

  updatePasswordHistory(user, user.passwordHash);
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.passwordChangedAt = new Date();
  user.passwordExpiresAt = addDays(env.passwordExpiresDays);
  await user.save();

  await logAuditEvent({
    req,
    action: "auth.password_changed",
    targetId: String(user._id),
  });

  return res.json({ message: "Password updated successfully." });
};

const updateProfile = async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  if (!env.encryptionKey) {
    return res.status(500).json({ error: "Encryption key missing." });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const { name, phone, address, dob } = parsed.data;
  if (name !== undefined) {
    user.profileNameEnc = encryptField(name);
  }
  if (phone !== undefined) {
    user.profilePhoneEnc = encryptField(phone);
  }
  if (address !== undefined) {
    user.profileAddressEnc = encryptField(address);
  }
  if (dob !== undefined) {
    user.profileDobEnc = encryptField(dob);
  }

  await user.save();

  await logAuditEvent({
    req,
    action: "user.profile_updated",
    targetId: String(user._id),
  });

  return res.json({
    message: "Profile updated.",
    profile: {
      name: decryptField(user.profileNameEnc),
      phone: decryptField(user.profilePhoneEnc),
      address: decryptField(user.profileAddressEnc),
      dob: decryptField(user.profileDobEnc),
    },
  });
};

module.exports = { getMe, changePassword, updateProfile };
