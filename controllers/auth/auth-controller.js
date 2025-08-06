// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../../models/User");
// const sendEmail = require("../../helpers/mailer");

// // REGISTER
// const registerUser = async (req, res) => {
//   const { userName, email, password } = req.body;

//   try {
//     const checkUser = await User.findOne({ email });
//     if (checkUser)
//       return res.json({
//         success: false,
//         message: "User Already exists with the same email! Please try again",
//       });

//     const hashPassword = await bcrypt.hash(password, 12);
//     const newUser = new User({
//       userName,
//       email,
//       password: hashPassword,
//     });

//     await newUser.save();
//     res.status(200).json({
//       success: true,
//       message: "Registration successful",
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Some error occurred",
//     });
//   }
// };

// // // LOGIN
// // const loginUser = async (req, res) => {
// //   const { email, password } = req.body;

// //   try {
// //     const checkUser = await User.findOne({ email });
// //     if (!checkUser)
// //       return res.json({
// //         success: false,
// //         message: "User doesn't exist! Please register first",
// //       });

// //     const checkPasswordMatch = await bcrypt.compare(
// //       password,
// //       checkUser.password
// //     );
// //     if (!checkPasswordMatch)
// //       return res.json({
// //         success: false,
// //         message: "Incorrect password! Please try again",
// //       });

// //     const token = jwt.sign(
// //       {
// //         id: checkUser._id,
// //         role: checkUser.role,
// //         email: checkUser.email,
// //         userName: checkUser.userName,
// //       },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "60m" }
// //     );

// //     res.cookie("token", token, { httpOnly: true, secure: false }).json({
// //       success: true,
// //       message: "Logged in successfully",
// //       user: {
// //         email: checkUser.email,
// //         role: checkUser.role,
// //         id: checkUser._id,
// //         userName: checkUser.userName,
// //       },
// //     });
// //   } catch (e) {
// //     console.log(e);
// //     res.status(500).json({
// //       success: false,
// //       message: "Some error occurred",
// //     });
// //   }
// // };

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user)
//       return res.json({
//         success: false,
//         message: "User not found. Please register first.",
//       });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.json({ success: false, message: "Incorrect password" });

//     console.log("JWT Secret being Used:",process.env.JWT_SECRET);
    

//     const token = jwt.sign(
//       {
//         id: user._id,
//         role: user.role,
//         email: user.email,
//         userName: user.userName,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     // ✅ Secure cookie setup
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "None",
//       maxAge: 24 * 60 * 60 * 1000,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Logged in successfully",
//       token,
//       user: {
//         email: user.email,
//         role: user.role,
//         id: user._id,
//         userName: user.userName,
//       },
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// // LOGOUT
// const logoutUser = (req, res) => {
//   res.clearCookie("token").json({
//     success: true,
//     message: "Logged out successfully!",
//   });
// };

// // AUTH MIDDLEWARE
// const authMiddleware = async (req, res, next) => {
//   const token = req.cookies.token;
// console.log("incoming cookie token:",token);


//   if (!token)
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized user!",
//     });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: "Unauthorized user!",
//     });
//   }
// };

// // FORGOT PASSWORD
// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User Not Found" });
//     }

//     // Create token
//     const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     // Send Email
//     await sendEmail(
//       user.email,
//       "Password Reset Link",
//       `You requested a password reset. Click the link below to reset your password:\n\n` +
//         `http://localhost:5173/reset-password/${user._id}/${token}\n\n` +
//         `If you did not request this, please ignore the email.`
//     );

//     res.status(200).json({ message: "Email sent successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // RESET PASSWORD
// const resetPassword = async (req, res) => {
//   try {
//     const { id, token } = req.params;
//     const { password } = req.body;

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded) {
//       return res.status(404).json({ message: "Invalid token" });
//     }

//     const hashPassword = await bcrypt.hash(password, 10);

//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       { password: hashPassword },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User Not Found" });
//     }

//     res.status(200).json({ message: "Password reset successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // FINAL EXPORT
// module.exports = {
//   registerUser,
//   loginUser,
//   logoutUser,
//   authMiddleware,
//   forgotPassword,
//   resetPassword,
// };


const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const sendEmail = require("../../helpers/mailer");

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      userName: user.userName,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

/**
 * REGISTER USER
 */
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ userName, email, password: hashedPassword });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

/**
 * LOGIN USER
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Incorrect password" });

    //  Generate token
    const token = generateToken(user);

    //  Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token, 
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        userName: user.userName,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/**
 * LOGOUT USER
 */
const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * AUTH MIDDLEWARE
 */
const authMiddleware = (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized! No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * FORGOT PASSWORD
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `http://localhost:5173/reset-password/${user._id}/${token}`;

    await sendEmail(user.email, "Password Reset", `Click here to reset: ${resetLink}`);

    res.status(200).json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * RESET PASSWORD
 */
const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  forgotPassword,
  resetPassword,
};