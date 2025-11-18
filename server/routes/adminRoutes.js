import express from "express";
import {
  adminLogin,
  adminLogout,
  verifyAdminSession,
  getAllUsers,
  toggleBan,
  getAllComments,
  deleteComment,
  replyToComment,
} from "../controllers/adminController.js";

import { verifyAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/logout", adminLogout);
router.get("/session", verifyAdmin, verifyAdminSession);

router.get("/users", verifyAdmin, getAllUsers);
router.put("/ban/:userId", verifyAdmin, toggleBan);

router.get("/comments", verifyAdmin, getAllComments);
router.delete("/comments/:id", verifyAdmin, deleteComment);
router.post("/comments/reply/:id", verifyAdmin, replyToComment);

export default router;
