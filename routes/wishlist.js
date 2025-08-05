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



// const express = require("express");
// const router = express.Router();
// const authMiddleware = require("../middleware/auth");
// const Wishlist = require("../models/Wishlist"); // Or wherever you manage it

// // GET wishlist
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const wishlist = await Wishlist.findOne({ user: userId }).populate("products");
//     res.json(wishlist);
//   } catch (err) {
//     console.error("Wishlist fetch error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // ADD to wishlist
// router.post("/", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { _id: productId } = req.body;

//     let wishlist = await Wishlist.findOne({ user: userId });
//     if (!wishlist) {
//       wishlist = new Wishlist({ user: userId, products: [productId] });
//     } else if (!wishlist.products.includes(productId)) {
//       wishlist.products.push(productId);
//     }

//     await wishlist.save();
//     res.json({ wishlist });
//   } catch (err) {
//     console.error("Add to wishlist error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // DELETE from wishlist
// router.delete("/:productId", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const productId = req.params.productId;

//     await Wishlist.updateOne({ user: userId }, { $pull: { products: productId } });

//     res.json({ msg: "Removed from wishlist" });
//   } catch (err) {
//     console.error("Remove from wishlist error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// module.exports = router;