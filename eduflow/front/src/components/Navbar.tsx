import React, { useState, useRef, useEffect } from "react";
import { BarChart3, GraduationCap, HomeIcon, LayoutDashboard, PlayCircle, LogIn, UserPlus, User, ChevronDown, LogOut, Settings, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, userRole, isLoggedIn, userName, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Iniciales del usuario para el avatar
  const initials = userName
    ? userName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const navLinks = [
    { tab: "home",       label: "Inicio",            Icon: HomeIcon       },
    { tab: "courses",    label: "Cursos",             Icon: PlayCircle     },
    { tab: "analytics",  label: "Analíticas",         Icon: BarChart3      },
    ...(userRole === "instructor"
      ? [{ tab: "instructor", label: "Panel Instructor", Icon: LayoutDashboard }]
      : [{ tab: "dashboard",  label: "Mi panel",         Icon: LayoutDashboard }]
    ),
  ];

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top"
      style={{
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
        zIndex: 1030,
      }}
    >
      <div className="container">

        {/* Logo */}
        <a
          className="navbar-brand fw-bold d-flex align-items-center gap-2 text-decoration-none"
          href="#"
          onClick={e => { e.preventDefault(); setActiveTab("home"); }}
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: 36, height: 36, background: "linear-gradient(135deg,#1565c0,#1e88e5)" }}
          >
            <GraduationCap size={20} className="text-white" strokeWidth={1.8} />
          </div>
          <span style={{ color: "#0f172a", fontSize: "1.15rem" }}>
            Edu<span style={{ color: "#1565c0" }}>Flow</span>
          </span>
        </a>

        {/* Toggler mobile */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">

          {/* Links centrales — solo si está logueado */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isLoggedIn && navLinks.map(({ tab, label, Icon }) => (
              <li className="nav-item" key={tab}>
                <a
                  className="nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-3 mx-1"
                  href="#"
                  onClick={e => { e.preventDefault(); setActiveTab(tab); }}
                  style={{
                    color: activeTab === tab ? "#1565c0" : "#475569",
                    fontWeight: activeTab === tab ? 600 : 400,
                    background: activeTab === tab ? "#eff6ff" : "transparent",
                    fontSize: "0.9rem",
                    transition: "all 0.15s",
                  }}
                >
                  <Icon size={16} strokeWidth={activeTab === tab ? 2.2 : 1.8} />
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Zona derecha */}
          <div className="d-flex align-items-center gap-2 ms-auto">

            {isLoggedIn ? (
              /* ── Usuario logueado: menú desplegable ── */
              <div className="position-relative" ref={dropdownRef}>
                <button
                  className="btn d-flex align-items-center gap-2 rounded-pill px-3 py-2"
                  style={{
                    border: "1px solid #e2e8f0",
                    background: dropdownOpen ? "#f1f5f9" : "white",
                    fontSize: "0.875rem",
                    color: "#0f172a",
                    transition: "background 0.15s",
                  }}
                  onClick={() => setDropdownOpen(v => !v)}
                >
                  {/* Avatar con iniciales */}
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                    style={{
                      width: 30, height: 30,
                      background: "linear-gradient(135deg,#1565c0,#1e88e5)",
                      color: "white",
                      fontSize: "0.72rem",
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <span className="d-none d-sm-block fw-semibold" style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userName || "Usuario"}
                  </span>
                  <span className="d-none d-sm-block badge rounded-pill" style={{ background: "#eff6ff", color: "#1565c0", fontSize: "0.65rem", fontWeight: 600, padding: "3px 8px" }}>
                    {userRole === "instructor" ? "INSTRUCTOR" : "ESTUDIANTE"}
                  </span>
                  <ChevronDown
                    size={14}
                    style={{ color: "#94a3b8", transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "none" }}
                  />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div
                    className="position-absolute end-0 mt-2 py-1 rounded-3"
                    style={{
                      minWidth: 210,
                      background: "white",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                      zIndex: 1050,
                      animation: "fadeIn 0.12s ease",
                    }}
                  >
                    {/* Header */}
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <div className="fw-semibold" style={{ fontSize: "0.875rem", color: "#0f172a" }}>
                        {userName}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        {userRole === "instructor" ? "Instructor" : "Estudiante"}
                      </div>
                    </div>

                    {/* Items */}
                    {[
                      { icon: User,      label: "Mi perfil",      tab: "profile"  },
                      { icon: BookOpen,  label: "Mis cursos",     tab: "courses"  },
                      { icon: Settings,  label: "Configuración",  tab: "settings" },
                    ].map(({ icon: Icon, label, tab }) => (
                      <button
                        key={tab}
                        className="btn w-100 text-start d-flex align-items-center gap-3 px-4 py-2"
                        style={{ fontSize: "0.875rem", color: "#374151", borderRadius: 0, background: "transparent" }}
                        onClick={() => { setActiveTab(tab); setDropdownOpen(false); }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <Icon size={15} strokeWidth={1.8} style={{ color: "#64748b" }} />
                        {label}
                      </button>
                    ))}

                    {/* Cerrar sesión */}
                    <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 4, paddingTop: 4 }}>
                      <button
                        className="btn w-100 text-start d-flex align-items-center gap-3 px-4 py-2"
                        style={{ fontSize: "0.875rem", color: "#dc2626", borderRadius: 0, background: "transparent" }}
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fff5f5")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <LogOut size={15} strokeWidth={1.8} />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>

            ) : (
              /* ── Sin sesión: botones login / registro ── */
              <>
                <button
                  className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-pill px-3"
                  style={{ fontSize: "0.875rem", fontWeight: 500, borderWidth: 1.5 }}
                  onClick={() => setActiveTab("login")}
                >
                  <LogIn size={15} />
                  <span className="d-none d-sm-inline">Iniciar sesión</span>
                  <span className="d-sm-none">Entrar</span>
                </button>
                <button
                  className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-3"
                  style={{ fontSize: "0.875rem", fontWeight: 500, background: "linear-gradient(90deg,#1565c0,#1e88e5)", border: "none" }}
                  onClick={() => setActiveTab("register")}
                >
                  <UserPlus size={15} />
                  <span className="d-none d-sm-inline">Registrarse</span>
                  <span className="d-sm-none">Nuevo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        .navbar-toggler:focus { box-shadow: none; }
      `}</style>
    </nav>
  );
};

export default Navbar;
