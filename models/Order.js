const mongoose = require("mongoose");
const Product = require("./Product");

const OrderSchema = new mongoose.Schema({
  userId: String,
  cartId: String,
  cartItems: [
    {
      productId: {
        type: String,
        ref: "Product",
      },
      title: String,
      image: String,
      price: String,
      quantity: Number,
    },
  ],
  addressInfo: {
    addressId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  itemAmount: {
    type: Number,
    default: 0,
  },

  shippingCost: {
    type: Number,
    default: 0,
  },
  totalAmount: Number,

  orderDate: Date,
  orderUpdateDate: Date,
  paymentId: String,
  payerId: String,
});

module.exports = mongoose.model("Order", OrderSchema);
