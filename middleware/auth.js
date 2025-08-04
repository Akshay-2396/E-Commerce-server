// const jwt = require("jsonwebtoken");

// module.exports = function (req, res, next) {
//   const token = req.cookies.token;

//   if (!token) return res.status(401).json({ msg: "No token" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: "Token not valid" });
//   }
// };


const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      (req.header("Authorization") && req.header("Authorization").replace("Bearer ", ""));

    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(401).json({ msg: "Token not valid" });
  }
};

module.exports = authMiddleware;