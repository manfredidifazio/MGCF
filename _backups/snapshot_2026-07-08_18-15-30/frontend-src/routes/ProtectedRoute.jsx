import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const { loading } = useAuth();

  if (loading) return null;
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
