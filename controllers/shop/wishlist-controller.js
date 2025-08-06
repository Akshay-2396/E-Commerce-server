const Wishlist = require("../../models/Wishlist");

// ✅ Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware
    const wishlist = await Wishlist.find({ userId }).populate("productId");
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching wishlist" });
  }
};

// ✅ Add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const existing = await Wishlist.findOne({ userId, productId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Already added" });
    }

    const wishlistItem = new Wishlist({ userId, productId });
    await wishlistItem.save();

    const updated = await Wishlist.find({ userId }).populate("productId");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding to wishlist" });
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await Wishlist.findOneAndDelete({ userId, productId: id });
    const updated = await Wishlist.find({ userId }).populate("productId");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error removing from wishlist" });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };