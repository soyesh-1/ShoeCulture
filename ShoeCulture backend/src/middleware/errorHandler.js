const errorHandler = (err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "Invalid CSRF token." });
  }
  if (err.message === "Invalid file type.") {
    return res.status(400).json({ error: "Invalid file type." });
  }

  console.error("API error:", err.message || err);
  const status = err.statusCode || 500;

  res.status(status).json({
    error: err.message || "Internal Server Error",
  });
};

module.exports = { errorHandler };
