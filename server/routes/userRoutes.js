import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  getUserProfile,
  updateUser,
  logoutUser
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// =========================
// 🔐 AUTH ROUTES
// =========================
router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/logout", logoutUser);


router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);

// =========================
// 🔒 PROTECTED ROUTES
// =========================
router.get("/profile", protect, getUserProfile);
router.put("/update", protect, updateUser);  // <-- FIXED: should be PUT
router.get("/me", protect, getCurrentUser);




export default router;
