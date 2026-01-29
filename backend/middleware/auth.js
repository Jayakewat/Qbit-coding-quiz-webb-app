import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// const JWT_SECRET = 'your_jwt_secret_here';
const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }
  const token = authHeader.split(" ")[1];

  //verify
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    req.user = {
      _id: user._id,
      id: user._id.toString(),
      email: user.email,
    };
    next();
  } catch (err) {
    console.error("JWT VERIFICATION FAILED", err);
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }
}
