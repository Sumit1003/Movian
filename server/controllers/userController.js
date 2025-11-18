import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/email.js";
import User from "../models/User.js";
import VerifyPending from "../models/VerifyPending.js";

/** -----------------------------------------
 *  JWT GENERATOR
 * ----------------------------------------- */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/** -----------------------------------------
 *  REGISTER USER (Email Verification)
 * ----------------------------------------- */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, dob } = req.body;

    if (!username || !email || !password || !dob) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    await VerifyPending.deleteOne({ email });

    const hashedPassword = await bcrypt.hash(password, 12);

    const token = jwt.sign(
      { username, email, password: hashedPassword, dob },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    await VerifyPending.create({
      username,
      email,
      password: hashedPassword,
      dob,
      token,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${token}`;

    const emailResult = await sendEmail(
      email,
      "Verify Your Email - Movian",
      `
        <h2>Welcome to Movian 🎬</h2>
        <p>Click the button below to verify your email:</p>
        <a href="${verifyLink}" 
           style="
             display:inline-block;
             margin-top:10px;
             padding:10px 20px;
             background:#6366f1;
             color:white;
             border-radius:6px;
             text-decoration:none;
             font-weight:bold;">
          Verify Email
        </a>
        <p>If the button doesn't work, use this link:</p>
        <p>${verifyLink}</p>
      `
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Verification email could not be sent. Try again later.",
      });
    }

    return res.json({
      success: true,
      message: "Verification email sent. Check your inbox.",
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

/** -----------------------------------------
 *  LOGIN USER (Only if email verified)
 * ----------------------------------------- */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please check your inbox.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** -----------------------------------------
 *  LOGOUT USER
 * ----------------------------------------- */
export const logoutUser = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(0),
    };

    res.cookie("token", "", cookieOptions);
    res.cookie("admin_token", "", cookieOptions);

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("❌ Logout Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** -----------------------------------------
 *  FORGOT PASSWORD
 * ----------------------------------------- */
export const forgotPassword = async (req, res) => {
  try {
    const { email, dob } = req.body;

    if (!email || !dob) {
      return res.status(400).json({
        success: false,
        message: "Email and Date of Birth are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedDOB = new Date(dob).toISOString().split("T")[0];

    const user = await User.findOne({
      email: normalizedEmail,
      dob: normalizedDOB,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with provided details",
      });
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const emailHTML = `
      <div style="font-family: Arial; padding: 20px; background: #111; color: white;">
        <h2 style="color: #ff4545;">Reset Your Movian Password</h2>
        <p>Hello <strong>${user.username}</strong>,</p>
        <p>You requested to reset your Movian account password.</p>
        <a href="${resetLink}"
          style="
            display: inline-block;
            margin-top: 20px;
            padding: 12px 20px;
            background: #ff4545;
            color: white;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;">
          Reset Password
        </a>
        <p style="margin-top: 20px; color: #bbb;">
          If you didn't request this, ignore this email.
          <br />This link expires in <strong>1 hour</strong>.
        </p>
      </div>
    `;

    const emailResult = await sendEmail(
      user.email,
      "Reset Your Movian Password",
      emailHTML
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Try again later.",
      });
    }

    return res.json({
      success: true,
      message: "Password reset link sent to your email.",
    });

  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** -----------------------------------------
 *  RESET PASSWORD (After clicking email link)
 * ----------------------------------------- */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // 1️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    // 2️⃣ Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4️⃣ Update user password
    user.password = hashedPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });

  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/** -----------------------------------------
 *  VERIFY EMAIL
 * ----------------------------------------- */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Validate token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link",
      });
    }

    // Find pending record
    const pending = await VerifyPending.findOne({ token });
    if (!pending) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or has expired",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: pending.email });
    if (existingEmail) {
      await VerifyPending.deleteOne({ token });
      return res.json({
        success: true,
        message: "Email already verified",
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: pending.username });
    if (existingUsername) {
      await VerifyPending.deleteOne({ token });
      return res.status(400).json({
        success: false,
        message: "Username already taken. Please register with another username.",
      });
    }

    // Create verified user
    const newUser = await User.create({
      username: pending.username,
      email: pending.email,
      password: pending.password,
      dob: pending.dob,
      isVerified: true,
    });

    await VerifyPending.deleteOne({ token });

    const authToken = generateToken(newUser._id);

    res.cookie("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });

  } catch (err) {
    console.error("Verify Email Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/** -----------------------------------------
 *  GET CURRENT USER
 * ----------------------------------------- */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({ success: true, user });

  } catch (err) {
    console.error("❌ Get Current User Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** -----------------------------------------
 *  USER PROFILE
 * ----------------------------------------- */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({ success: true, user });

  } catch (err) {
    console.error("❌ Profile Fetch Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** -----------------------------------------
 *  UPDATE USER PROFILE
 * ----------------------------------------- */
export const updateUser = async (req, res) => {
  try {
    const updates = req.body;
    const allowed = ["username", "email", "dob", "avatar"];
    const safeUpdates = {};

    Object.keys(updates).forEach((key) => {
      if (allowed.includes(key)) safeUpdates[key] = updates[key];
    });

    if (safeUpdates.email) {
      safeUpdates.email = safeUpdates.email.toLowerCase().trim();

      const exists = await User.findOne({
        email: safeUpdates.email,
        _id: { $ne: req.user.id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use by another account",
        });
      }
    }

    const updatedUser =
      await User.findByIdAndUpdate(req.user.id, safeUpdates, { new: true })
        .select("-password");

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (err) {
    console.error("❌ Update User Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
