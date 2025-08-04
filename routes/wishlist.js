const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// Get all wishlist items for logged-in user
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate("wishlist");
  res.json(user.wishlist);
});

// Add a product to wishlist
router.post("/", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const { _id } = req.body;

  if (!user.wishlist.includes(_id)) {
    user.wishlist.push(_id);
    await user.save();
  }

  res.status(200).json({ success: true, wishlist: user.wishlist });
});

// Remove a product from wishlist
router.delete("/:id", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.wishlist = user.wishlist.filter(
    (prodId) => prodId.toString() !== req.params.id
  );
  await user.save();
  res.sendStatus(204);
});

module.exports = router;
