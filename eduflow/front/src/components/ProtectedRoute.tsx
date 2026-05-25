import React from "react";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "student" | "instructor";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isLoggedIn, userRole, setActiveTab } = useAuth();

  if (!isLoggedIn) {
    return <Login onNavigateToRegister={() => setActiveTab("register")} />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: "#f8fafc" }}
      >
        <div className="text-center px-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
            style={{ width: 80, height: 80, background: "#fef2f2", border: "2px solid #fecaca" }}
          >
            <i className="bi bi-shield-exclamation" style={{ fontSize: 36, color: "#dc2626" }} />
          </div>
          <h2 className="fw-bold mb-2" style={{ color: "#0f172a" }}>Acceso denegado</h2>
          <p className="text-muted mb-4">No tienes permisos para ver esta sección.</p>
          <button
            className="btn btn-primary rounded-pill px-4"
            style={{ background: "linear-gradient(90deg,#1565c0,#1e88e5)", border: "none" }}
            onClick={() => setActiveTab("home")}
          >
            <i className="bi bi-house me-2" />
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
