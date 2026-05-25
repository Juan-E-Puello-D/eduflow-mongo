import { useEffect, useState, type FC } from "react";
import { Container, Row, Col, Button, Card, Badge, Spinner } from "react-bootstrap";
import { GraduationCap, PlayCircle, Star, Users, Clock, ArrowRight, BookOpen } from "lucide-react";
import { getCursos } from "../services/cursosService";
import type { Curso as Course } from "../types/models";
import { useAuth } from "../context/AuthContext";

// Skeleton card mientras carga
const SkeletonCard: FC = () => (
  <Card className="h-100 border-0 rounded-4 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
    <div className="bg-light" style={{ height: 160 }} />
    <Card.Body className="p-4">
      <div className="bg-light rounded mb-3" style={{ height: 20, width: "40%" }} />
      <div className="bg-light rounded mb-2" style={{ height: 22, width: "85%" }} />
      <div className="bg-light rounded mb-4" style={{ height: 16, width: "55%" }} />
      <div className="d-flex justify-content-between align-items-center">
        <div className="bg-light rounded" style={{ height: 28, width: "30%" }} />
        <div className="bg-light rounded-pill" style={{ height: 34, width: "35%" }} />
      </div>
    </Card.Body>
  </Card>
);

// Genera color de fondo por categoría
const categoryColor = (cat: string): string => {
  const map: Record<string, string> = {
    react:      "linear-gradient(135deg,#dbeafe,#bfdbfe)",
    mongodb:    "linear-gradient(135deg,#dcfce7,#bbf7d0)",
    fullstack:  "linear-gradient(135deg,#ede9fe,#ddd6fe)",
    javascript: "linear-gradient(135deg,#fef9c3,#fef08a)",
    node:       "linear-gradient(135deg,#dcfce7,#86efac)",
    css:        "linear-gradient(135deg,#fce7f3,#fbcfe8)",
  };
  const key = cat.toLowerCase().replace(/\s+/g, "");
  return map[key] ?? "linear-gradient(135deg,#f1f5f9,#e2e8f0)";
};

const categoryIconColor = (cat: string): string => {
  const map: Record<string, string> = {
    react: "#3b82f6", mongodb: "#16a34a", fullstack: "#7c3aed",
    javascript: "#ca8a04", node: "#15803d", css: "#db2777",
  };
  return map[cat.toLowerCase().replace(/\s+/g, "")] ?? "#64748b";
};

const CourseCard: FC<{ course: Course }> = ({ course }) => {
  const [hovered, setHovered] = useState(false);
  const cat = course.categoria ?? "General";
  const price = course.precio === 0 ? "Gratis" : `$${course.precio}`;
  const rating = (3.8 + Math.random() * 1.2).toFixed(1);
  const students = Math.floor(Math.random() * 2000 + 300);
  const duration = `${Math.floor((course.duracionTotal ?? 0) / 60) || Math.floor(Math.random() * 20 + 5)}h`;
  const title = course.titulo;
  const instructor = course.instructorId;

  return (
    <Card
      className="h-100 border-0 rounded-4 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered
          ? "0 12px 32px rgba(59,130,246,0.18)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "all 0.25s ease",
        cursor: "pointer",
      }}
    >
      {/* Thumbnail */}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: 160, background: categoryColor(cat), position: "relative" }}
      >
        <PlayCircle
          size={52}
          strokeWidth={1.2}
          style={{ color: categoryIconColor(cat), opacity: 0.7 }}
        />
        <Badge
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "rgba(255,255,255,0.9)",
            color: categoryIconColor(cat),
            fontWeight: 600,
            fontSize: "0.72rem",
            letterSpacing: "0.02em",
            padding: "5px 10px",
            borderRadius: 20,
          }}
        >
          {cat}
        </Badge>
      </div>

      <Card.Body className="p-4 d-flex flex-column">
        {/* Título */}
        <Card.Title className="fw-bold mb-1" style={{ fontSize: "1rem", lineHeight: 1.35, color: "#0f172a" }}>
          {title}
        </Card.Title>
        <p className="text-muted mb-3" style={{ fontSize: "0.82rem" }}>
          <BookOpen size={12} className="me-1" />
          {course.nivel ?? "Curso"}
        </p>

        {/* Stats */}
        <div className="d-flex gap-3 mb-3" style={{ fontSize: "0.78rem", color: "#64748b" }}>
          <span className="d-flex align-items-center gap-1">
            <Star size={12} fill="#facc15" stroke="#facc15" />
            <span style={{ fontWeight: 600, color: "#0f172a" }}>{rating}</span>
          </span>
          <span className="d-flex align-items-center gap-1">
            <Users size={12} />
            {students.toLocaleString()}
          </span>
          <span className="d-flex align-items-center gap-1">
            <Clock size={12} />
            {duration}
          </span>
        </div>

        {/* Precio + CTA */}
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <span style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>
            {price}
          </span>
          <Button
            variant="primary"
            size="sm"
            className="d-flex align-items-center gap-1 rounded-pill px-3"
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              background: hovered ? "#1d4ed8" : "#3b82f6",
              border: "none",
              transition: "background 0.2s",
            }}
          >
            Ver detalle <ArrowRight size={13} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

const Home: FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { setActiveTab } = useAuth();

  useEffect(() => {
    getCursos()
      .then((data) => setCourses(data))
      .catch((error: unknown) => console.error("Error cargando cursos:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* Hero */}
      <section
        className="text-white"
        style={{
          background: "linear-gradient(135deg, #1a1f6e 0%, #1565c0 60%, #1e88e5 100%)",
          padding: "80px 0 70px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Círculos decorativos */}
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.07)", top: -120, right: -60, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.06)", bottom: -60, left: 60, pointerEvents: "none" }} />

        <Container style={{ position: "relative", zIndex: 1 }}>
          <Row className="align-items-center">
            <Col md={7}>
              <Badge
                className="mb-3 px-3 py-2 rounded-pill"
                style={{ background: "rgba(255,255,255,0.15)", fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.04em" }}
              >
                ✦ Plataforma #1 de aprendizaje Fullstack
              </Badge>
              <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.15 }}>
                Aprende sin límites<br />con EduFlow
              </h1>
              <p className="mb-4" style={{ fontSize: "1.05rem", opacity: 0.8, maxWidth: 440 }}>
                Domina MongoDB, React y el desarrollo Fullstack con proyectos reales.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Button
                  size="lg"
                  variant="light"
                  className="rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
                  style={{ color: "#1565c0", border: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
                  onClick={() => setActiveTab("courses")}
                >
                  Explorar cursos <ArrowRight size={16} />
                </Button>
                <Button
                  size="lg"
                  variant="outline-light"
                  className="rounded-pill px-4 fw-semibold"
                  style={{ borderWidth: 1.5 }}
                >
                  Saber más
                </Button>
              </div>

              {/* Mini stats */}
              <div className="d-flex gap-4 mt-5" style={{ fontSize: "0.85rem" }}>
                {[
                  { value: "12K+", label: "Estudiantes" },
                  { value: "80+",  label: "Cursos" },
                  { value: "4.8★", label: "Valoración" },
                ].map(s => (
                  <div key={s.label}>
                    <div className="fw-bold" style={{ fontSize: "1.1rem" }}>{s.value}</div>
                    <div style={{ opacity: 0.65 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </Col>

            <Col md={5} className="d-none d-md-flex justify-content-center">
              <GraduationCap size={190} strokeWidth={0.8} style={{ color: "rgba(255,255,255,0.12)" }} />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Cursos destacados */}
      <Container className="py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-5">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#0f172a" }}>Cursos Destacados</h2>
            <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
              Selecciona tu próximo curso y mejora tus habilidades.
            </p>
          </div>
          <Button
            variant="outline-primary"
            className="rounded-pill px-4 d-flex align-items-center gap-2 fw-semibold"
            style={{ fontSize: "0.875rem", borderWidth: 1.5 }}
            onClick={() => setActiveTab("courses")}
          >
            Ver todos <ArrowRight size={14} />
          </Button>
        </div>

        {loading ? (
          <Row className="g-4">
            {[1, 2, 3].map(i => (
              <Col key={i} md={4}>
                <SkeletonCard />
              </Col>
            ))}
          </Row>
        ) : courses.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <BookOpen size={48} strokeWidth={1} className="mb-3 opacity-25" />
            <p className="mb-0">No hay cursos disponibles por ahora.</p>
          </div>
        ) : (
          <Row className="g-4">
            {courses.map(c => (
              <Col key={c._id} md={4}>
                <CourseCard course={c} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Home;