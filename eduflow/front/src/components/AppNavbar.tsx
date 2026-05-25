import React from "react";
import { useAuth } from "../context/AuthContext";
import { BookOpen, LayoutDashboard, BarChart3, Search, GraduationCap, PlayCircle } from "lucide-react";
import { Navbar as RBNavbar, Nav, Container, Button } from "react-bootstrap";

const AppNavbar: React.FC = () => {
  const { activeTab, setActiveTab, userRole } = useAuth();

  const navLinks = [
    { id: "home", label: "Inicio", icon: <BookOpen size={18} /> },
    { id: "courses", label: "Cursos", icon: <PlayCircle size={18} /> },
    { id: "analytics", label: "Analíticas", icon: <BarChart3 size={18} />, highlight: true },
    userRole === "instructor" && { id: "instructor", label: "Panel Instructor", icon: <LayoutDashboard size={18} /> },
  ].filter(Boolean) as { id: string; label: string; icon: React.ReactNode; highlight?: boolean }[];

  return (
    <RBNavbar bg="white" expand="lg" sticky="top" className="border-bottom shadow-sm">
      <Container>
        <RBNavbar.Brand className="fw-bold d-flex align-items-center gap-2" onClick={() => setActiveTab("home")} style={{ cursor: "pointer" }}>
          <div className="bg-primary text-white rounded p-2 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
            <GraduationCap size={18} />
          </div>
          <span>
            Edu<span className="text-primary">Flow</span>
          </span>
        </RBNavbar.Brand>

        <RBNavbar.Toggle aria-controls="main-navbar" />
        <RBNavbar.Collapse id="main-navbar">
          <Nav className="me-auto my-3 my-lg-0">
            {navLinks.map((link) => (
              <Nav.Link
                key={link.id}
                active={activeTab === link.id}
                onClick={() => setActiveTab(link.id)}
                className={`d-flex align-items-center gap-2 rounded-pill px-3 ${
                  activeTab === link.id
                    ? link.highlight
                      ? "bg-primary bg-opacity-10 text-primary"
                      : "bg-secondary bg-opacity-10"
                    : "text-muted"
                }`}
              >
                {link.icon}
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center gap-3">
            <Button variant="outline-secondary" className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
              <Search size={18} />
            </Button>
            <div className="d-flex align-items-center gap-3 border-start ps-3">
              <div className="text-end d-none d-md-block">
                <div className="fw-semibold">Ana Gómez</div>
                <div className="text-muted text-uppercase small">{userRole}</div>
              </div>
              <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
                A
              </div>
            </div>
          </div>
        </RBNavbar.Collapse>
      </Container>
    </RBNavbar>
  );
};

export default AppNavbar;
