import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Wrap a route element with this to require login (and optionally a
// specific role). Not logged in -> redirect to /login, remembering where
// they were headed. Logged in but wrong role -> redirect to their own
// dashboard instead of showing them someone else's broken/empty data.
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallback = role === "ADMIN" ? "/admin" : role === "VENDOR" ? "/provider" : "/browse";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
