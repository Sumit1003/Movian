// fixAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config(); // load .env

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing. Check your .env file.");
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ DB connected");

    const result = await User.updateOne(
      { email: "admin@movian.com" },
      {
        $set: {
          password:
            "$2b$12$yfxCX2NBk2Br9a3cZT0UkuT8Jv37oTQUt2bnFv/uia6AOuMfh6rpG", // hash for Admin@123
          role: "admin",
          isVerified: true,
          isBanned: false,
        },
      }
    );

    console.log("🔄 Update result:", result);
    console.log("✅ Admin password updated.");
  } catch (err) {
    console.error("❌ Fix admin error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
