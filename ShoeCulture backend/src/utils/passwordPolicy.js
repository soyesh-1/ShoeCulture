const MIN_LENGTH = 10;
const HISTORY_LIMIT = 5;

const validatePassword = (password) => {
  const errors = [];
  if (password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters.`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must include an uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must include a lowercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must include a number.");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must include a symbol.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = { validatePassword, HISTORY_LIMIT };
