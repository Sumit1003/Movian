import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL;

const AdminProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null); // null = loading

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch(`${API}/api/admin/session`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.success && data.admin?.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  // Loading
  if (isAdmin === null) return null;

  // Not admin → redirect
  if (isAdmin === false) {
    return <Navigate to="/admin-login" replace />;
  }

  // Admin → allow
  return children;
};

export default AdminProtectedRoute;
