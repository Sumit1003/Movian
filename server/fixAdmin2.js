import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";   // ONLY bcryptjs
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");

    const hash = await bcrypt.hash("Admin@123", 12);
    console.log("NEW HASH:", hash);

    const result = await User.updateOne(
      { email: "admin@movian.com" },
      { password: hash }
    );

    console.log("UPDATED:", result);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
