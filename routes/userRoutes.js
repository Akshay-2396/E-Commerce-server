const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// Get profile
router.get("/profile", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// Update profile
router.put("/profile", auth, async (req, res) => {
  const { userName, email, phone, address } = req.body;

  const updated = await User.findByIdAndUpdate(
    req.user.id,
    { userName, email, phone, address },
    { new: true }
  ).select("-password");

  res.json(updated);
});

module.exports = router;
