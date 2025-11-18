//server/controller/verifyAdmin.js
import jwt from "jsonwebtoken";

export const verifyAdmin = async (req, res, next) => {
  try {
    const token =
      req.cookies.admin_token ||
      req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Admin token missing",
      });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin")
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });

    req.admin = decoded;
    next();

  } catch (err) {
    console.error("verifyAdmin error:", err);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
