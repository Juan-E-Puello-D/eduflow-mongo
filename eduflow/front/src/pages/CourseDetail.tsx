import { useEffect, useMemo, useState, type FC } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  ProgressBar,
  ListGroup,
  Spinner,
  Alert,
  Card,
} from "react-bootstrap";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Layers,
  PlayCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getCursoById } from "../services/cursosService";
import {
  getInscripciones,
  inscribirse,
  marcarProgreso,
} from "../services/inscripcionesService";
import type { Curso, Inscripcion } from "../types/models";

const CourseDetail: FC = () => {
  const {
    selectedCourseId,
    setSelectedCourseId,
    setActiveTab,
    user,
  } = useAuth();

  const [course, setCourse] = useState<Curso | null>(null);
  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCourseId) {
      setError("No hay ningún curso seleccionado.");
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const curso = await getCursoById(selectedCourseId);
        setCourse(curso);

        if (user) {
          const ins = await getInscripciones({ usuarioId: user._id, cursoId: selectedCourseId });
          setInscripcion(ins.length > 0 ? ins[0] : null);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información del curso.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedCourseId, user]);

  const totalLecciones = course?.lecciones?.length ?? 0;
  const completedLessons = inscripcion?.leccionesCompletadas?.length ?? 0;
  const progress = totalLecciones > 0 ? Math.round((completedLessons / totalLecciones) * 100) : 0;
  const isEnrolled = !!inscripcion;
  const isComplete = progress >= 100 && totalLecciones > 0;

  const backToCourses = () => {
    setSelectedCourseId(null);
    setActiveTab("courses");
  };

  const handleEnroll = async () => {
    if (!course || !user) return;

    setSaving(true);
    try {
      const created = await inscribirse(user._id, course._id);
      setInscripcion(created);
    } catch (err) {
      console.error(err);
      setError("No se pudo inscribir en el curso. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkCompleted = async (leccionId: string) => {
    if (!inscripcion || !course) return;
    if (inscripcion.leccionesCompletadas.some((id) => id === leccionId)) return;

    setSaving(true);
    try {
      const updated = await marcarProgreso(inscripcion._id, leccionId, totalLecciones);
      setInscripcion(updated);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el progreso. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const lessons = useMemo(
    () => course?.lecciones?.slice().sort((a, b) => a.orden - b.orden) ?? [],
    [course]
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1f6e 0%, #1565c0 60%, #1e88e5 100%)", padding: "48px 0 40px" }}>
        <Container>
          <Button
            variant="outline-light"
            size="sm"
            className="rounded-pill mb-4"
            onClick={backToCourses}
            style={{ borderColor: "rgba(255,255,255,0.35)", color: "white" }}
          >
            <ArrowLeft size={16} /> Volver a cursos
          </Button>

          <div className="d-flex flex-column gap-3">
            <div>
              <h1 className="fw-bold text-white mb-2" style={{ fontSize: "clamp(1.75rem, 4vw, 2.6rem)" }}>
                {course?.titulo ?? "Detalle de curso"}
              </h1>
              <p className="text-white-50 mb-0" style={{ fontSize: "1rem" }}>
                {course?.descripcion ?? "Revisa las lecciones y tu progreso en este curso."}
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              {course?.categoria && (
                <Badge bg="light" text="dark" className="rounded-pill py-2 px-3">
                  {course.categoria}
                </Badge>
              )}
              {course?.nivel && (
                <Badge bg="light" text="dark" className="rounded-pill py-2 px-3">
                  Nivel {course.nivel}
                </Badge>
              )}
              {course && (
                <Badge bg="light" text="dark" className="rounded-pill py-2 px-3">
                  {course.precio === 0 ? "Gratis" : `$${course.precio}`}
                </Badge>
              )}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : !course ? (
          <Alert variant="warning">No se encontró el curso seleccionado.</Alert>
        ) : (
          <>
            <Row className="g-4 mb-4">
              <Col lg={8}>
                <Card className="shadow-sm rounded-4 p-4">
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                      <div>
                        <h2 className="fw-bold" style={{ color: "#0f172a" }}>{course.titulo}</h2>
                        <p className="text-muted mb-0">{course.descripcion}</p>
                      </div>
                      <div className="text-md-end">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <PlayCircle size={18} />
                          <span className="fw-semibold">{totalLecciones} lecciones</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Clock size={18} />
                          <span className="fw-semibold">{course.duracionTotal} min</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div>
                          <div className="text-muted" style={{ fontSize: "0.85rem" }}>Progreso</div>
                          <div className="fw-bold" style={{ fontSize: "1.25rem" }}>
                            {completedLessons} de {totalLecciones} lecciones
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="text-muted" style={{ fontSize: "0.85rem" }}>Avance</div>
                          <div className="fw-bold" style={{ fontSize: "1.25rem" }}>
                            {progress}%
                          </div>
                        </div>
                      </div>

                      <ProgressBar now={progress} className="mt-3" style={{ height: 12, borderRadius: 999 }} variant={isComplete ? "success" : "primary"} />
                    </div>

                    {!isEnrolled ? (
                      <Card className="border border-dashed p-3 bg-light">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                          <div>
                            <h5 className="fw-semibold mb-1">Activa tu seguimiento</h5>
                            <p className="mb-0 text-muted" style={{ fontSize: "0.92rem" }}>
                              Inscríbete para rastrear tu progreso y marcar lecciones como completadas.
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            onClick={handleEnroll}
                            disabled={saving || !user}
                            className="rounded-pill px-4"
                          >
                            {saving ? "Inscribiendo..." : user ? "Inscribirme" : "Inicia sesión para inscribirte"}
                          </Button>
                        </div>
                      </Card>
                    ) : isComplete ? (
                      <Alert variant="success" className="mb-0">
                        <CheckCircle size={18} className="me-2" />
                        ¡Felicidades! Has completado todas las lecciones.
                      </Alert>
                    ) : (
                      <Alert variant="info" className="mb-0">
                        <strong>{completedLessons}</strong> lecciones completadas, sigue adelante para terminar el curso.
                      </Alert>
                    )}
                  </div>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="shadow-sm rounded-4 p-4 h-100">
                  <h5 className="fw-bold mb-3">Detalles del curso</h5>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="text-muted">Categoría</span>
                    <span>{course.categoria}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="text-muted">Nivel</span>
                    <span>{course.nivel}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="text-muted">Precio</span>
                    <span>{course.precio === 0 ? "Gratis" : `$${course.precio}`}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="text-muted">Duración</span>
                    <span>{course.duracionTotal} min</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="text-muted">Lecciones</span>
                    <span>{totalLecciones}</span>
                  </div>
                  {user && (
                    <div className="mt-4">
                      <Button
                        variant="outline-primary"
                        className="w-100 rounded-pill"
                        onClick={backToCourses}
                      >
                        Volver a cursos
                      </Button>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            <Card className="shadow-sm rounded-4 p-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                <div>
                  <h3 className="fw-bold mb-1">Lecciones</h3>
                  <p className="text-muted mb-0">{totalLecciones} lección{totalLecciones !== 1 ? "es" : ""} disponibles</p>
                </div>
                <div className="d-flex align-items-center gap-2 text-muted">
                  <Layers size={18} />
                  <span>{completedLessons} completadas</span>
                </div>
              </div>

              <ListGroup variant="flush">
                {lessons.map((leccion, index) => {
                  const isCompletedLesson = inscripcion?.leccionesCompletadas.some((id) => id === leccion._id);

                  return (
                    <ListGroup.Item key={leccion._id} className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 py-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Badge bg={isCompletedLesson ? "success" : "secondary"} pill>
                            {isCompletedLesson ? "✔" : index + 1}
                          </Badge>
                          <span className="fw-semibold">{leccion.titulo}</span>
                        </div>
                        <div className="text-muted small d-flex align-items-center gap-2">
                          <Clock size={14} />
                          <span>{leccion.duracion} min</span>
                        </div>
                        {isEnrolled && leccion.videoUrl && (
                          <div className="mt-2">
                            <a
                              href={leccion.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="d-inline-flex align-items-center gap-1 text-primary"
                            >
                              <PlayCircle size={14} />
                              Ver video
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
                        <Badge bg={isCompletedLesson ? "success" : "light"} text={isCompletedLesson ? "light" : "dark"}>
                          {isCompletedLesson ? "Completada" : "Pendiente"}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleMarkCompleted(leccion._id)}
                          disabled={!isEnrolled || isCompletedLesson || saving}
                          variant={isCompletedLesson ? "outline-success" : "primary"}
                          className="rounded-pill"
                        >
                          {isCompletedLesson ? "Listo" : isEnrolled ? "Marcar como completada" : "Inscríbete"}
                        </Button>
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
};

export default CourseDetail;
