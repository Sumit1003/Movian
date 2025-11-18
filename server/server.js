import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import { sendEmail } from "./config/email.js";

import movieRoutes from "./routes/movieRoutes.js";
import authRoutes from "./routes/userRoutes.js";
import myListRoutes from "./routes/myListRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import embedRoutes from "./routes/embedRoutes.js";

const app = express();

// --------------------------------------------------------
// ✅ PRODUCTION-READY CORS (Local + Render + Cookies)
// --------------------------------------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://movian.onrender.com",
  "https://movian.vercel.app",
  process.env.CLIENT_URL  // fallback
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile apps, curl, postman
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("❌ CORS blocked: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// --------------------------------------------------------
// MIDDLEWARES
// --------------------------------------------------------
app.use(express.json());
app.use(cookieParser());

// --------------------------------------------------------
// DATABASE CONNECTION
// --------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// --------------------------------------------------------
// ROUTES
// --------------------------------------------------------
app.use("/api/movies", movieRoutes);
app.use("/api/mylist", myListRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/embed", embedRoutes);

// Test Route
app.get("/test-email", async (req, res) => {
  const mail = await sendEmail(
    "sumitkumar104059@gmail.com",
    "Movian Test Email",
    "<h1>Hello Sumit!</h1><p>Movian email system works 🎉</p>"
  );
  res.json(mail);
});

// --------------------------------------------------------
// SERVER START
// --------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🌍 CORS Allowed Origins:", allowedOrigins);
});
