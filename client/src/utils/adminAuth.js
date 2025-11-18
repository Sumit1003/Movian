// src/utils/adminAuth.js
import { api } from "./api"; // use your global axios instance

export const isAdminLoggedIn = async () => {
  try {
    const res = await api.get("/api/admin/session");

    if (!res.data || !res.data.success) return false;

    // Must be admin role
    return res.data.admin?.role === "admin";
  } catch (err) {
    console.error("Admin session check failed:", err);
    return false;
  }
};
