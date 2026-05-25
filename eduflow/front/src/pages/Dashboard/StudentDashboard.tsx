import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner } from "react-bootstrap";
import {
  BookOpen, CheckCircle, Clock, Award, ArrowRight,
  TrendingUp, Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getInscripciones } from "../../services/inscripcionesService";
import { getCursoById } from "../../services/cursosService";
import { CourseCard } from "../../components/CourseCardShared";
import type { Inscripcion, Curso } from "../../types/models";

interface CourseProgress {
  curso: Curso;
  inscripcion: Inscripcion;
}

const StudentDashboard: React.FC = () => {
  const { user, setActiveTab, setSelectedCourseId } = useAuth();
  const [items, setItems] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const inscripciones = await getInscripciones({ usuarioId: user._id });
        const resolved = await Promise.all(
          inscripciones.map(async (ins) => {
            const curso = await getCursoById(ins.cursoId);
            return { curso, inscripcion: ins };
          })
        );
        setItems(resolved);
      } catch {
        setError("No se pudieron cargar tus cursos.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const completed = items.filter(i => i.inscripcion.porcentajeProgreso >= 100).length;
  const inProgress = items.filter(i => i.inscripcion.porcentajeProgreso > 0 && i.inscripcion.porcentajeProgreso < 100).length;

  const stats = [
    { label: "Inscrito en",  value: items.length, icon: BookOpen,    color: "#3b82f6", bg: "#eff6ff" },
    { label: "En progreso",  value: inProgress,   icon: Clock,       color: "#f59e0b", bg: "#fffbeb" },
    { label: "Completados",  value: completed,    icon: CheckCircle, color: "#22c55e", bg: "#f0fdf4" },
    { label: "Certificados", value: completed,    icon: Award,       color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  const initials = user?.nombre
    ? user.nombre.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* Header con gradiente */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1f6e 0%, #1565c0 60%, #1e88e5 100%)",
          padding: "48px 0 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.07)", top: -100, right: -60, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.05)", bottom: -50, left: 40, pointerEvents: "none" }} />

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
                ESTUDIANTE
              </Badge>
              <h1 className="text-white fw-bold mb-0" style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)" }}>
                ¡Bienvenido, {user?.nombre?.split(" ")[0] ?? "estudiante"}!
              </h1>
              <p className="mb-0" style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.95rem" }}>
                Continúa aprendiendo donde lo dejaste.
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
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{ width: 40, height: 40, background: bg }}>
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
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>Retoma donde lo dejaste</p>
          </div>
          <button
            className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-2 fw-semibold"
            style={{ fontSize: "0.875rem", borderWidth: 1.5 }}
            onClick={() => setActiveTab("courses")}
          >
            Explorar más <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando tus cursos...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger rounded-3" style={{ fontSize: "0.9rem" }}>
            <i className="bi bi-exclamation-circle me-2" />{error}
          </div>
        ) : items.length === 0 ? (
          <Card className="border-0 text-center py-5" style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <BookOpen size={52} strokeWidth={1} style={{ color: "#cbd5e1", margin: "0 auto 16px" }} />
            <h5 className="fw-semibold" style={{ color: "#475569" }}>Todavía no estás inscrito en ningún curso</h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>Descubre cientos de cursos y comienza a aprender hoy.</p>
            <div>
              <button
                className="btn btn-primary rounded-pill px-5 fw-semibold"
                style={{ background: "linear-gradient(90deg,#1565c0,#1e88e5)", border: "none" }}
                onClick={() => setActiveTab("courses")}
              >
                Explorar cursos
              </button>
            </div>
          </Card>
        ) : (
          <Row className="g-4">
            {items.map(({ curso, inscripcion }) => {
              const pct = Math.round(inscripcion.porcentajeProgreso);
              const isComplete = pct >= 100;
              return (
                <Col key={curso._id} md={6} lg={4}>
                  <CourseCard
                    course={curso}
                    rating={0}
                    students={0}
                    progress={pct}
                    actionLabel={isComplete ? "Ver certificado" : "Continuar"}
                    onAction={() => {
                      setSelectedCourseId(curso._id);
                      setActiveTab("courseDetail");
                    }}
                  />
                </Col>
              );
            })}
          </Row>
        )}

        {/* Acciones rápidas */}
        <h2 className="fw-bold mt-5 mb-4" style={{ color: "#0f172a" }}>Acciones rápidas</h2>
        <Row className="g-3">
          {[
            { icon: Zap,        label: "Explorar cursos",  desc: "Descubre nuevos contenidos",          tab: "courses",   color: "#3b82f6", bg: "#eff6ff" },
            { icon: TrendingUp, label: "Ver analíticas",   desc: "Revisa tu progreso general",           tab: "analytics", color: "#8b5cf6", bg: "#f5f3ff" },
            { icon: Award,      label: "Mis certificados", desc: `${completed} obtenido${completed !== 1 ? "s" : ""}`, tab: "profile", color: "#f59e0b", bg: "#fffbeb" },
          ].map(({ icon: Icon, label, desc, tab, color, bg }) => (
            <Col key={tab} md={4}>
              <button
                className="btn w-100 text-start p-4 border-0"
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
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: 44, height: 44, background: bg }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div>
                    <div className="fw-semibold" style={{ color: "#0f172a", fontSize: "0.95rem" }}>{label}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{desc}</div>
                  </div>
                </div>
              </button>
            </Col>
          ))}
        </Row>

      </Container>
    </div>
  );
};

export default StudentDashboard;
