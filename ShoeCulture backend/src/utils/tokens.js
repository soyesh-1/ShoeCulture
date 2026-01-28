const crypto = require("crypto");

const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const addMinutes = (minutes) => new Date(Date.now() + minutes * 60 * 1000);
const addDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

module.exports = { generateOtp, hashToken, addMinutes, addDays };
