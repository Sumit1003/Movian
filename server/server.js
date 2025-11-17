import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";


import movieRoutes from "./routes/movieRoutes.js";
import authRoutes from "./routes/userRoutes.js";
import myListRoutes from "./routes/myListRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import embedRoutes from "./routes/embedRoutes.js";


dotenv.config();

// -----------------------------
// ENV CHECK LOGS
// -----------------------------
console.log("🔍 Environment Check:");
[
  "MONGO_URI",
  "CLIENT_URL",
  "JWT_SECRET",
  "OMDB_API_KEY",
  "YOUTUBE_API_KEY",
  "EMAIL_USER",
  "EMAIL_PASS"
].forEach(key => {
  console.log(`${key}:`, !!process.env[key]);
});
console.log("------------------------------------");

const app = express();

// -----------------------------
// CORS CONFIG
// -----------------------------
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL            // Deployment frontend (Render)
];

console.log("🔍 Allowed CORS Origins:", allowedOrigins);

app.use(cors({
  origin: process.env.CLIENT_URL,   // e.g. https://movian.vercel.app
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


// Middlewares
app.use(express.json());
app.use(cookieParser());

// DATABASE CONNECTION
// -----------------------------
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI not found in .env file");
    process.exit(1);
}

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ DB Error:", err));

// -----------------------------
// HEALTH CHECK ENDPOINT
// -----------------------------
app.get("/api/health", (req, res) => {
  const mongoState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    node: process.version,
    mongo: mongoState,
    env: {
      MONGO_URI: !!process.env.MONGO_URI,
      CLIENT_URL: !!process.env.CLIENT_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      OMDB_API_KEY: !!process.env.OMDB_API_KEY,
      YOUTUBE_API_KEY: !!process.env.YOUTUBE_API_KEY,
      EMAIL_USER: !!process.env.EMAIL_USER
    }
  });
});

// -----------------------------
// API ROUTES
// -----------------------------
app.use("/api/movies", movieRoutes);
app.use("/api/mylist", myListRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/embed", embedRoutes);


// -----------------------------
// START SERVER
// -----------------------------
const PORT = process.env.PORT || 5000;

console.log("🔍 Server Port:", PORT);

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
