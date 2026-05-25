import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner } from "react-bootstrap";
import {
  Users, BookOpen, Star, PlusCircle, BarChart3,
  PlayCircle, Settings, ArrowRight, TrendingUp, Eye,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getCursos } from "../../services/cursosService";
import { getInscripciones } from "../../services/inscripcionesService";
import type { Curso } from "../../types/models";

const categoryColor = (cat: string) => {
  const map: Record<string, string> = {
    react: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
    mongodb: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
    fullstack: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
    javascript: "linear-gradient(135deg,#fef9c3,#fef08a)",
    node: "linear-gradient(135deg,#dcfce7,#86efac)",
    css: "linear-gradient(135deg,#fce7f3,#fbcfe8)",
  };
  return map[cat.toLowerCase().replace(/\s+/g, "")] ?? "linear-gradient(135deg,#f1f5f9,#e2e8f0)";
};

const categoryIconColor = (cat: string) => {
  const map: Record<string, string> = {
    react: "#3b82f6", mongodb: "#16a34a", fullstack: "#7c3aed",
    javascript: "#ca8a04", node: "#15803d", css: "#db2777",
  };
  return map[cat.toLowerCase().replace(/\s+/g, "")] ?? "#64748b";
};

const InstructorDashboard: React.FC = () => {
  const { user, setActiveTab } = useAuth();
  const [courses, setCourses] = useState<Curso[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const all = await getCursos({ instructorId: user._id });
        setCourses(all);

        const ins = await getInscripciones();
        const myStudents = ins.filter(i => all.some(c => c._id === i.cursoId));
        const unique = new Set(myStudents.map(i => i.usuarioId));
        setTotalStudents(unique.size);
      } catch {
        setError("No se pudieron cargar los datos del panel.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const published = courses.filter(c => c.publicado).length;
  const avgRating = 4.7;

  const stats = [
    { label: "Mis cursos",       value: courses.length, icon: BookOpen,    color: "#3b82f6", bg: "#eff6ff" },
    { label: "Publicados",       value: published,      icon: Eye,         color: "#22c55e", bg: "#f0fdf4" },
    { label: "Estudiantes",      value: totalStudents,  icon: Users,       color: "#f59e0b", bg: "#fffbeb" },
    { label: "Valoración media", value: avgRating,      icon: Star,        color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  const initials = user?.nombre
    ? user.nombre.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "I";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1f2e 0%, #2d1b69 50%, #4c1d95 100%)",
          padding: "48px 0 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.07)", top: -110, right: -70, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.05)", bottom: -60, left: 30, pointerEvents: "none" }} />

        <Container style={{ position: "relative", zIndex: 1 }}>
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
              style={{ width: 70, height: 70, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "white", fontSize: "1.5rem", border: "2px solid rgba(255,255,255,0.3)" }}
            >
              {initials}
            </div>
            <div>
              <Badge
                className="rounded-pill px-3 py-2 mb-2"
                style={{ background: "rgba(255,255,255,0.15)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em" }}
              >
                INSTRUCTOR
              </Badge>
              <h1 className="text-white fw-bold mb-0" style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)" }}>
                Panel de Instructor
              </h1>
              <p className="mb-0" style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.95rem" }}>
                Hola {user?.nombre?.split(" ")[0] ?? "instructor"}, gestiona tus cursos desde aquí.
              </p>
            </div>
          </div>

          <Row className="mt-4 g-3">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <Col key={label} xs={6} md={3}>
                <div
                  className="d-flex align-items-center gap-3 rounded-3 p-3"
                  style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)" }}
                >
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: 40, height: 40, background: bg }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <div className="fw-bold text-white" style={{ fontSize: "1.25rem", lineHeight: 1.1 }}>{value}</div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>{label}</div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      <Container className="py-5">

        {/* Mis cursos */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Mis cursos</h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>Administra y actualiza tu contenido</p>
          </div>
          <button
            className="btn rounded-pill px-4 d-flex align-items-center gap-2 fw-semibold text-white"
            style={{ background: "linear-gradient(90deg,#7c3aed,#8b5cf6)", border: "none", fontSize: "0.875rem" }}
            onClick={() => setActiveTab("create-course")}
          >
            <PlusCircle size={16} /> Crear curso
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{ color: "#7c3aed" }} />
            <p className="mt-3 text-muted">Cargando tus cursos...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger rounded-3" style={{ fontSize: "0.9rem" }}>
            <i className="bi bi-exclamation-circle me-2" />{error}
          </div>
        ) : courses.length === 0 ? (
          <Card className="border-0 text-center py-5" style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <BookOpen size={52} strokeWidth={1} style={{ color: "#cbd5e1", margin: "0 auto 16px" }} />
            <h5 className="fw-semibold" style={{ color: "#475569" }}>Aún no has creado ningún curso</h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>Comparte tu conocimiento creando tu primer curso.</p>
            <div>
              <button
                className="btn rounded-pill px-5 fw-semibold text-white"
                style={{ background: "linear-gradient(90deg,#7c3aed,#8b5cf6)", border: "none" }}
                onClick={() => setActiveTab("create-course")}
              >
                <PlusCircle size={16} className="me-2" /> Crear mi primer curso
              </button>
            </div>
          </Card>
        ) : (
          <Row className="g-4">
            {courses.map(curso => {
              const cat = curso.categoria ?? "General";
              return (
                <Col key={curso._id} md={6} lg={4}>
                  <Card
                    className="border-0 h-100"
                    style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 28px rgba(124,58,237,0.15)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = "none";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center position-relative"
                      style={{ height: 130, background: categoryColor(cat) }}
                    >
                      <PlayCircle size={44} strokeWidth={1.2} style={{ color: categoryIconColor(cat), opacity: 0.65 }} />
                      <Badge style={{ position: "absolute", top: 10, left: 10, background: "rgba(255,255,255,0.9)", color: categoryIconColor(cat), fontWeight: 600, fontSize: "0.7rem", padding: "4px 10px", borderRadius: 20 }}>
                        {cat}
                      </Badge>
                      <div
                        style={{
                          position: "absolute", top: 10, right: 10,
                          background: curso.publicado ? "#22c55e" : "#94a3b8",
                          color: "white", borderRadius: 20, padding: "4px 10px", fontSize: "0.7rem", fontWeight: 600,
                        }}
                      >
                        {curso.publicado ? "Publicado" : "Borrador"}
                      </div>
                    </div>

                    <Card.Body className="p-4">
                      <h6 className="fw-bold mb-1" style={{ color: "#0f172a", lineHeight: 1.3 }}>{curso.titulo}</h6>
                      <p className="text-muted mb-3" style={{ fontSize: "0.8rem" }}>
                        {curso.nivel} · {curso.lecciones?.length ?? 0} lecciones
                      </p>

                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          <Star size={13} fill="#facc15" stroke="#facc15" />
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>4.8</span>
                          <span style={{ color: "#94a3b8" }}>valoración</span>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm rounded-3 px-3 fw-semibold"
                            style={{ fontSize: "0.75rem", background: "#f5f3ff", color: "#7c3aed", border: "none" }}
                            onClick={() => setActiveTab("analytics")}
                          >
                            <BarChart3 size={12} className="me-1" />Stats
                          </button>
                          <button
                            className="btn btn-sm rounded-3 px-3 fw-semibold"
                            style={{ fontSize: "0.75rem", background: "linear-gradient(90deg,#7c3aed,#8b5cf6)", color: "white", border: "none" }}
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Acciones rápidas */}
        <h2 className="fw-bold mt-5 mb-4" style={{ color: "#0f172a" }}>Acciones rápidas</h2>
        <Row className="g-3">
          {[
            { icon: PlusCircle, label: "Crear curso",       desc: "Añade nuevo contenido",          tab: "create-course", color: "#7c3aed", bg: "#f5f3ff" },
            { icon: TrendingUp, label: "Analíticas",        desc: "Visualiza el rendimiento",        tab: "analytics",     color: "#3b82f6", bg: "#eff6ff" },
            { icon: Users,      label: "Mis estudiantes",   desc: `${totalStudents} en total`,       tab: "students",      color: "#f59e0b", bg: "#fffbeb" },
            { icon: Settings,   label: "Configuración",     desc: "Ajusta tu perfil",                tab: "settings",      color: "#64748b", bg: "#f8fafc" },
          ].map(({ icon: Icon, label, desc, tab, color, bg }) => (
            <Col key={tab} xs={6} md={3}>
              <button
                className="btn w-100 text-start p-3 p-md-4 border-0"
                style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "transform 0.18s, box-shadow 0.18s" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "none";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                }}
                onClick={() => setActiveTab(tab)}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: 40, height: 40, background: bg }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <div className="fw-semibold" style={{ color: "#0f172a", fontSize: "0.9rem" }}>{label}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{desc}</div>
                  </div>
                </div>
              </button>
            </Col>
          ))}
        </Row>

        {/* Consejo del panel */}
        <div
          className="mt-5 p-4 rounded-4 d-flex align-items-start gap-3"
          style={{ background: "linear-gradient(135deg,#f5f3ff,#ede9fe)", border: "1px solid #ddd6fe" }}
        >
          <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: 44, height: 44, background: "#7c3aed" }}>
            <Star size={20} style={{ color: "white" }} />
          </div>
          <div>
            <h6 className="fw-bold mb-1" style={{ color: "#4c1d95" }}>Consejo para instructores</h6>
            <p className="mb-0" style={{ fontSize: "0.875rem", color: "#6d28d9" }}>
              Los cursos con videos cortos (5-10 min), ejercicios prácticos y actualizaciones frecuentes obtienen hasta 3× más inscripciones. ¡Sigue publicando!
            </p>
          </div>
        </div>

      </Container>
    </div>
  );
};

export default InstructorDashboard;
