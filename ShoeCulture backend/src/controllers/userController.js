const getMe = async (req, res) => {
  return res.json({
    id: req.user._id,
    email: req.user.email,
    role: req.user.role,
    createdAt: req.user.createdAt,
  });
};

module.exports = { getMe };
