import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";

const Login = () => {
  const [mode, setMode] = useState("user"); // "user" or "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  /* -----------------------------------------
     HANDLE LOGIN (User / Admin)
  ------------------------------------------ */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("LOGIN → MODE:", mode);
console.log("LOGIN EMAIL:", email);
console.log("LOGIN PASSWORD:", `"${password}"`);

    try {
      const API = import.meta.env.VITE_API_BASE_URL;
      if (!API) {
        toast.error("Missing API URL. Set VITE_API_BASE_URL.");
        return;
      }

      const endpoint =
        mode === "user"
          ? `${API}/api/auth/login`
          : `${API}/api/admin/login`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // REQUIRED for Render auth cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Invalid credentials");
        return;
      }

      /* ---------- USER LOGIN ---------- */
      if (mode === "user") {
        // Backend sets the session cookie automatically
        login(data.user); // Removed invalid data.token
        toast.success("Login successful");
        navigate("/");
        return;
      }

      /* ---------- ADMIN LOGIN ---------- */
      if (mode === "admin") {
        toast.success("Admin logged in");
        window.location.href = "/admin/dashboard";
        return;
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-black">
      
      {/* LEFT PANEL — LOGIN CARD */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 lg:px-12 relative z-30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#101010]/90 backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl p-10 sm:p-12 w-full max-w-md"
        >

          {/* LOGO */}
          <h1
            className="text-center text-5xl font-bold tracking-wide mb-6 text-red-600"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            MOVIAN
          </h1>

          {/* TOGGLE ADMIN / USER */}
          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={() => setMode("user")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                mode === "user"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              User Login
            </button>

            <button
              onClick={() => setMode("admin")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition-all ${
                mode === "admin"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              <Shield size={14} /> Admin
            </button>
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-2">
            {mode === "user" ? "Welcome Back" : "Admin Access"}
          </h2>

          <p className="text-gray-400 text-center mb-8">
            {mode === "user"
              ? "Sign in to continue to Movian"
              : "Restricted admin portal"}
          </p>

          {/* FORM */}
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder={
                  mode === "admin" ? "admin@movian.com" : "you@example.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-3 pl-12 pr-4 bg-black/40 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full py-3 pl-12 pr-12 bg-black/40 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* USER ONLY OPTIONS */}
            {mode === "user" && (
              <div className="flex justify-between items-center">
                <label className="flex gap-2 items-center text-gray-400 text-sm">
                  <input type="checkbox" className="accent-red-600" />
                  Remember me
                </label>

                <Link
                  className="text-red-500 text-sm hover:underline"
                  to="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 transition-all py-3 rounded-xl text-white font-semibold shadow-lg shadow-red-600/40"
            >
              {loading
                ? mode === "user"
                  ? "Signing in..."
                  : "Verifying..."
                : mode === "user"
                ? "Sign In"
                : "Admin Login"}
            </button>
          </form>

          {/* FOOTER */}
          {mode === "user" && (
            <p className="text-center text-gray-400 mt-6 text-sm">
              Don’t have an account?{" "}
              <Link className="text-red-500 hover:underline font-semibold" to="/register">
                Sign Up
              </Link>
            </p>
          )}
        </motion.div>
      </div>

      {/* RIGHT PANEL — BACKGROUND */}
      <div className="hidden md:block md:w-1/2 relative">
        <img
          src="/cinema_seats.jpg"
          alt="Cinema Seats"
          className="w-full h-full object-cover brightness-[0.40]"
        />

        <div className="absolute bottom-10 left-10 text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-4"
          >
            Unlimited movies, TV shows, and more
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-lg"
          >
            Watch anywhere. Cancel anytime.
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Login;
