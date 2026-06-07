import { Navigate } from "react-router-dom";

function getTokenData() {
  const token = localStorage.getItem("volo_token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function ProtectedRoute({ children, allowedRoles }) {
  const tokenData = getTokenData();

  if (!tokenData) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(tokenData.role)) {
    if (tokenData.role === "client") {
      return <Navigate to="/client-portal" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
