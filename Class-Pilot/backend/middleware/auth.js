// File: /backend/middleware/auth.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes and attach user to req
export const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2. if no token found block the access
  if (!token) {
    return res.status(401).json({message: "Not authorized, no token"});
  }

  try {
    // 3. Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user info (without password) to req
    req.user = await User.findById(decoded.userId).select("-password");

    next();
  } catch (error) {
    res.status(401).json({message: "Not authorized, token failed"});
  }
};
