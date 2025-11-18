import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

const isProduction = process.env.NODE_ENV === "production";

/* -------------------------------------------
   TOKEN CREATOR
-------------------------------------------- */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* -------------------------------------------
   ADMIN LOGIN
-------------------------------------------- */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "admin" });

    if (!admin)
      return res.status(400).json({ success: false, message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(admin._id, "admin");

    // IMPORTANT COOKIE FIX (WORKS ON LOCAL + RENDER)
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "none", // required for localhost ports
      domain: "localhost",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Admin login successful",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });

  } catch (err) {
    console.error("Admin Login Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------------------------------
   ADMIN LOGOUT
-------------------------------------------- */
export const adminLogout = async (req, res) => {
  res.cookie("admin_token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? "none" : "none",
    domain: "localhost",
    path: "/",
  });

  return res.json({ success: true, message: "Logged out" });
};

/* -------------------------------------------
   VERIFY ADMIN SESSION
-------------------------------------------- */
export const verifyAdminSession = async (req, res) => {
  return res.json({ success: true, admin: req.admin });
};

/* -------------------------------------------
   GET ALL USERS
-------------------------------------------- */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

/* -------------------------------------------
   BAN / UNBAN USER
-------------------------------------------- */
export const toggleBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: user.isBanned ? "User banned" : "User unbanned",
      user,
    });
  } catch {
    res.status(500).json({ success: false, message: "Error updating user" });
  }
};

/* -------------------------------------------
   COMMENTS
-------------------------------------------- */
export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch {
    res.status(500).json({ success: false, message: "Failed to load comments" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Comment not found" });

    res.json({ success: true, message: "Comment deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const replyToComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment)
      return res.status(404).json({ success: false, message: "Comment not found" });

    comment.replies.push({
      adminName: "Admin",
      replyText: req.body.replyText,
      createdAt: new Date(),
    });

    await comment.save();
    res.json({ success: true, message: "Reply added", comment });
  } catch {
    res.status(500).json({ success: false, message: "Failed to reply" });
  }
};
