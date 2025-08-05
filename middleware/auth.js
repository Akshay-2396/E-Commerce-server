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


// module.exports = function (req, res, next) {
//   const token = req.cookies.token;

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized! No token provided.",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token.",
//     });
//   }
// };

// const jwt = require("jsonwebtoken");

// module.exports = function (req, res, next) {
//   let token = req.cookies.token;

//   if (!token && req.headers.authorization) {
//     const parts = req.headers.authorization.split(" ");
//     if (parts.length === 2 && parts[0] === "Bearer") {
//       token = parts[1];
//     }
//   }

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized! No token provided.",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token.",
//     });
//   }
// };