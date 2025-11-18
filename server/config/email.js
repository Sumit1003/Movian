import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

// Check environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ EMAIL_USER or EMAIL_PASS is missing in environment variables");
}

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,          // secure Gmail port
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // your App Password (16 chars)
  },
});

// Send email function (same signature as your old sendEmail)
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Movian" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("📨 Email sent:", result.messageId);

    return {
      success: true,
      id: result.messageId,
    };
  } catch (err) {
    console.error("❌ EMAIL SEND FAILED:", err);

    return {
      success: false,
      message: err.message,
    };
  }
};
