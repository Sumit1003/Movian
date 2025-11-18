import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // ❌ If NO user → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ If admin is logged in → block access to user pages
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ✅ Allow normal user
  return children;
};

export default ProtectedRoute;
