const crypto = require("crypto");
const { env } = require("../config/env");

const getKey = () => {
  if (!env.encryptionKey) {
    throw new Error("ENCRYPTION_KEY is missing.");
  }
  if (env.encryptionKey.length === 64) {
    return Buffer.from(env.encryptionKey, "hex");
  }
  return crypto.createHash("sha256").update(env.encryptionKey).digest();
};

const encryptField = (plaintext) => {
  if (!plaintext) {
    return "";
  }
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(plaintext), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString(
    "base64"
  )}`;
};

const decryptField = (payload) => {
  if (!payload) {
    return "";
  }
  const key = getKey();
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    return "";
  }
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
};

module.exports = { encryptField, decryptField };
