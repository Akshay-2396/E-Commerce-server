const Order = require("../../models/Order");
const Product = require("../../models/Product");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const adminid = req.query.adminid;
    const products = await Product.find({ adminid });
    const productIds = products.map((p) => p._id.toString());
    const orders = await Order.find({});

    const fillteredOrder = orders.filter(
      (order) =>
        order.cartItems.filter((item) => productIds.includes(item.productId))
          ?.length > 0
    );

    fillteredOrder.forEach((order) => {
      console.log(
        order.cartItems.filter((item) => productIds.includes(item.productId))
      );

      order.cartItems = order.cartItems.filter((item) =>
        productIds.includes(item.productId)
      );
    });

    if (!fillteredOrder.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: fillteredOrder,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id, adminid } = req.params;

    const products = await Product.find({ adminid });
    const productIds = products.map((p) => p._id.toString());
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }
    order.cartItems = order.cartItems.filter((item) =>
      productIds.includes(item.productId)
    );

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    await Order.findByIdAndUpdate(id, { orderStatus });

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
