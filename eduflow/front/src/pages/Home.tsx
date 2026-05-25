import { useEffect, useState, type FC } from "react";
import { Container, Row, Col, Button, Badge } from "react-bootstrap";
import { GraduationCap, ArrowRight, BookOpen } from "lucide-react";
import { getCursos } from "../services/cursosService";
import { getComentarios } from "../services/comentariosService";
import { getStudentCounts } from "../services/inscripcionesService";
import { useAuth } from "../context/AuthContext";
import { CourseCard, SkeletonCard, type CourseWithRating } from "../components/CourseCardShared";

const Home: FC = () => {
  const [topCourses, setTopCourses] = useState<CourseWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const { setActiveTab } = useAuth();

  useEffect(() => {
    Promise.all([getCursos(), getComentarios(), getStudentCounts()])
      .then(([cursos, comentarios, studentCounts]) => {

        const ratingMap = new Map<string, { sum: number; count: number }>();
        comentarios.forEach((comentario) => {
          if (comentario.cursoId && typeof comentario.calificacion === "number") {
            const current = ratingMap.get(comentario.cursoId) ?? { sum: 0, count: 0 };
            current.sum += comentario.calificacion;
            current.count += 1;
            ratingMap.set(comentario.cursoId, current);
          }
        });

        const ranked = cursos
          .map((curso) => ({
            ...curso,
            rating: ratingMap.has(curso._id)
              ? ratingMap.get(curso._id)!.sum / ratingMap.get(curso._id)!.count
              : 0,
            students: studentCounts[curso._id] ?? 0,
          }))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 6);

        setTopCourses(ranked);
      })
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
                ✦ Plataforma #1 de aprendizaje en línea ✦
              </Badge>
              <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.15 }}>
                Aprende sin límites<br />con EduFlow
              </h1>
              <p className="mb-4" style={{ fontSize: "1.05rem", opacity: 0.8, maxWidth: 440 }}>
                Domina el aprendizaje en línea con nuestra plataforma intuitiva, cursos de calidad y comunidad de apoyo. ¡Tu camino al éxito comienza aquí!
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
        ) : topCourses.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <BookOpen size={48} strokeWidth={1} className="mb-3 opacity-25" />
            <p className="mb-0">No hay cursos disponibles por ahora.</p>
          </div>
        ) : (
          <Row className="g-4">
            {topCourses.map((c) => (
              <Col key={c._id} md={4}>
                <CourseCard course={c} rating={c.rating} students={c.students} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Home;