const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    if (
      !userId ||
      !cartItems ||
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid cart items or user ID",
      });
    }

    if (typeof totalAmount !== "number") {
      return res.status(400).json({
        success: false,
        message: "Total amount must be a number",
      });
    }

    for (const item of cartItems) {
      if (
        typeof item.price !== "number" ||
        typeof item.quantity !== "number" ||
        !item.title ||
        !item.productId
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart item format",
        });
      }
    }

    const itemAmount = cartItems.reduce((sum, item) => {
      const price =
        item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
      return sum + price * item.quantity;
    }, 0);

    let shippingCost = 0;
    if (itemAmount < 1000) {
      shippingCost = 5;
    } else if (itemAmount < 2000) {
      shippingCost = 2.5;
    }

    const totalAmountWithShipping = itemAmount + shippingCost;

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
       application_context: {
        landing_page: "BILLING", // Directly show card form
        user_action: "PAY_NOW", // Show "Pay Now" button
      },
      redirect_urls: {
        return_url: "https://ecommercewebservices.netlify.app/shop/paypal-return",
        cancel_url: "https://ecommercewebservices.netlify.app/shop/paypal-cancel",
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => {
              const price =
                item.salePrice && item.salePrice > 0
                  ? item.salePrice
                  : item.price;
              return {
                name: item.title,
                sku: item.productId,
                price: price.toFixed(2),
                currency: "USD",
                quantity: item.quantity,
              };
            }),
            shipping_address: {
              recipient_name: addressInfo?.name || "Customer",
              line1: addressInfo?.address || "Address not provided",
              city: addressInfo?.city || "City",
              state: "State",
              postal_code: addressInfo?.pinCode || "000000",
              country_code: "US",
            },
          },
          amount: {
            currency: "USD",
            total: totalAmountWithShipping.toFixed(2),
            details: {
              subtotal: itemAmount.toFixed(2),
              shipping: shippingCost.toFixed(2),
            },
          },
          description: "Purchase from store",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log("❌ PayPal Error:", error?.response || error);
        return res.status(500).json({
          success: false,
          message: "Error while creating PayPal payment",
          error: error?.response || error,
        });
      }

      const newlyCreatedOrder = new Order({
        userId,
        cartId,
        cartItems,
        addressInfo,
        orderStatus,
        paymentMethod,
        paymentStatus,
        itemAmount,
        shippingCost,
        totalAmount: totalAmountWithShipping,
        orderDate: new Date(orderDate).toISOString(),
        orderUpdateDate: new Date(orderUpdateDate).toISOString(),
        paymentId,
        payerId,
      });

      await newlyCreatedOrder.save();

      const approvalURL = paymentInfo.links.find(
        (link) => link.rel === "approval_url"
      )?.href;

      if (!approvalURL) {
        return res.status(500).json({
          success: false,
          message: "Approval URL not found in PayPal response",
        });
      }

      res.status(201).json({
        success: true,
        approvalURL,
        orderId: newlyCreatedOrder._id,
        shippingCost,
      });
    });
  } catch (e) {
    console.log("❗ Server Error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order cannot be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    for (const item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.title}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    await Cart.findByIdAndDelete(order.cartId);
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log("❗ Capture Payment Error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log("❗ Get Orders Error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log("❗ Get Order Details Error:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};




// const Stripe = require("stripe");
// const Order = require("../../models/Order");
// const Cart = require("../../models/Cart");
// const Product = require("../../models/Product");

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Set in .env

// const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       cartItems,
//       addressInfo,
//       orderStatus,
//       paymentMethod,
//       paymentStatus,
//       totalAmount,
//       orderDate,
//       orderUpdateDate,
//       paymentId,
//       payerId,
//       cartId,
//     } = req.body;

//     if (
//       !userId ||
//       !cartItems ||
//       !Array.isArray(cartItems) ||
//       cartItems.length === 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing or invalid cart items or user ID",
//       });
//     }

//     if (typeof totalAmount !== "number") {
//       return res.status(400).json({
//         success: false,
//         message: "Total amount must be a number",
//       });
//     }

//     for (const item of cartItems) {
//       if (
//         typeof item.price !== "number" ||
//         typeof item.quantity !== "number" ||
//         !item.title ||
//         !item.productId
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid cart item format",
//         });
//       }
//     }

//     const itemAmount = cartItems.reduce((sum, item) => {
//       const price =
//         item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
//       return sum + price * item.quantity;
//     }, 0);

//     let shippingCost = 0;
//     if (itemAmount < 1000) {
//       shippingCost = 5;
//     } else if (itemAmount < 2000) {
//       shippingCost = 2.5;
//     }

//     const totalAmountWithShipping = itemAmount + shippingCost;

//     // ✅ Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"], // can add 'upi', 'paypal', etc. if enabled
//       line_items: cartItems.map((item) => {
//         const price =
//           item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
//         return {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: item.title,
//             },
//             unit_amount: Math.round(price * 100), // in cents
//           },
//           quantity: item.quantity,
//         };
//       }),
//       shipping_options: [
//         {
//           shipping_rate_data: {
//             display_name: "Standard Shipping",
//             type: "fixed_amount",
//             fixed_amount: {
//               amount: Math.round(shippingCost * 100),
//               currency: "usd",
//             },
//           },
//         },
//       ],
//       mode: "payment",
//       success_url: "https://ecommercewebservices.netlify.app/shop/stripe-return?session_id={CHECKOUT_SESSION_ID}",
//       cancel_url: "https://ecommercewebservices.netlify.app/shop/stripe-cancel",
//       metadata: {
//         userId,
//         cartId,
//       },
//     });

//     const newlyCreatedOrder = new Order({
//       userId,
//       cartId,
//       cartItems,
//       addressInfo,
//       orderStatus,
//       paymentMethod,
//       paymentStatus,
//       itemAmount,
//       shippingCost,
//       totalAmount: totalAmountWithShipping,
//       orderDate: new Date(orderDate).toISOString(),
//       orderUpdateDate: new Date(orderUpdateDate).toISOString(),
//       paymentId: session.id,
//       payerId: null,
//     });

//     await newlyCreatedOrder.save();

//     res.status(201).json({
//       success: true,
//       approvalURL: session.url, // Similar to PayPal approval_url
//       orderId: newlyCreatedOrder._id,
//       shippingCost,
//     });
//   } catch (e) {
//     console.log("❗ Server Error:", e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occurred!",
//     });
//   }
// };

// const capturePayment = async (req, res) => {
//   try {
//     const { paymentId, orderId } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order cannot be found",
//       });
//     }

//     // ✅ Retrieve session from Stripe
//     const session = await stripe.checkout.sessions.retrieve(paymentId);

//     if (session.payment_status !== "paid") {
//       return res.status(400).json({
//         success: false,
//         message: "Payment not successful",
//       });
//     }

//     order.paymentStatus = "paid";
//     order.orderStatus = "confirmed";
//     order.paymentId = paymentId;
//     order.payerId = session.customer || null;

//     for (const item of order.cartItems) {
//       const product = await Product.findById(item.productId);
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: `Product not found: ${item.title}`,
//         });
//       }

//       product.totalStock -= item.quantity;
//       await product.save();
//     }

//     await Cart.findByIdAndDelete(order.cartId);
//     await order.save();

//     res.status(200).json({
//       success: true,
//       message: "Order confirmed",
//       data: order,
//     });
//   } catch (e) {
//     console.log("❗ Capture Payment Error:", e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occurred!",
//     });
//   }
// };

// const getAllOrdersByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const orders = await Order.find({ userId });

//     if (!orders.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No orders found!",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: orders,
//     });
//   } catch (e) {
//     console.log("❗ Get Orders Error:", e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occurred!",
//     });
//   }
// };

// const getOrderDetails = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findById(id);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found!",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: order,
//     });
//   } catch (e) {
//     console.log("❗ Get Order Details Error:", e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occurred!",
//     });
//   }
// };

// module.exports = {
//   createOrder,
//   capturePayment,
//   getAllOrdersByUser,
//   getOrderDetails,
// };