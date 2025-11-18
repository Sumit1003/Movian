//src/pages/AdminLogin.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const API = import.meta.env.VITE_API_BASE_URL || "";
    const res = await fetch(`${API}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.success) {
      toast.success("Admin logged in");
      window.location.href = "/admin/dashboard";
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center text-white">
      <form
        onSubmit={submit}
        className="bg-[#111] p-8 rounded-xl w-full max-w-sm shadow-xl border border-gray-800"
      >
        <h2 className="text-3xl mb-6 font-bold text-red-500 text-center">
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Admin Email"
          className="w-full p-3 bg-black border border-gray-700 rounded mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Admin Password"
          className="w-full p-3 bg-black border border-gray-700 rounded mb-6"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-red-600 py-3 rounded hover:bg-red-700">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
