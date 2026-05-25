import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner } from "react-bootstrap";
import {
  Users, BookOpen, Star, PlusCircle,
  Settings, TrendingUp, Eye,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { CourseCard } from "../../components/CourseCardShared";
import { getCursos, getCursoById } from "../../services/cursosService";
import { getInscripciones } from "../../services/inscripcionesService";
import type { Curso } from "../../types/models";
import CreateCursoModal from "../../components/Dashboard/Instructor/CreateCursoModal";
import EditCursoModal from "../../components/Dashboard/Instructor/EditCursoModal";

const InstructorDashboard: React.FC = () => {
  const { user, setActiveTab,setSelectedCourseId } = useAuth();
  const [courses, setCourses] = useState<Curso[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [courseStudents, setCourseStudents] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editTarget, setEditTarget] = useState<Curso | null>(null);
  const [createTarget, setCreateTarget] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const all = await getCursos({ instructorId: user._id });
        setCourses(all);

        try {
          const ins = await getInscripciones();
          const myEnrollments = ins.filter(i => all.some(c => c._id === i.cursoId));
          const unique = new Set(myEnrollments.map(i => i.usuarioId));
          setTotalStudents(unique.size);

          const counts: Record<string, Set<string>> = {};
          myEnrollments.forEach(item => {
            if (!counts[item.cursoId]) {
              counts[item.cursoId] = new Set();
            }
            counts[item.cursoId].add(item.usuarioId);
          });
          setCourseStudents(Object.fromEntries(
            Object.entries(counts).map(([cursoId, set]) => [cursoId, set.size])
          ));
        } catch {
          // conteo de estudiantes no crítico
        }
      } catch {
        setError("No se pudieron cargar tus cursos.");
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

  const openEdit = async (curso: Curso) => {
    try {
      const fullCurso = await getCursoById(curso._id);
      setEditTarget(fullCurso);
    } catch {
      setEditTarget(curso);
    }
  };

  const closeEdit = () => {
    setEditTarget(null);
  };

  const closeCreate = () => {
    setCreateTarget(false);
  };

  const handleCreateSuccess = (nuevoCurso: Curso) => {
    setCourses(prev => [...prev, nuevoCurso]);
    closeCreate();
  };

  const handleEditSuccess = (cursoActualizado: Curso) => {
    setCourses(prev => prev.map(c => c._id === cursoActualizado._id ? cursoActualizado : c));
    closeEdit();
  };

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
            onClick={() => setCreateTarget(true)}
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
                onClick={() => setCreateTarget(true)}
              >
                <PlusCircle size={16} className="me-2" /> Crear mi primer curso
              </button>
            </div>
          </Card>
        ) : (
          <Row className="g-4">
            {courses.map(curso => (
              <Col key={curso._id} md={6} lg={4}>
                <CourseCard
                  course={curso}
                  rating={4.8}
                  students={courseStudents[curso._id] ?? 0}
                  onDetail={() => {
                    setSelectedCourseId(curso._id);
                    setActiveTab("courseDetail");
                  }}
                  onEdit={() => openEdit(curso)}
                />
              </Col>
            ))}
          </Row>
        )}

        {/* Acciones rápidas */}
        <h2 className="fw-bold mt-5 mb-4" style={{ color: "#0f172a" }}>Acciones rápidas</h2>
        <Row className="g-3">
          {[
            { icon: PlusCircle, label: "Crear curso",       desc: "Añade nuevo contenido",          action: () => setCreateTarget(true), color: "#7c3aed", bg: "#f5f3ff", key: "create" },
            { icon: TrendingUp, label: "Analíticas",        desc: "Visualiza el rendimiento",        action: () => setActiveTab("analytics"),     color: "#3b82f6", bg: "#eff6ff", key: "analytics" },
            { icon: Users,      label: "Mis estudiantes",   desc: `${totalStudents} en total`,       action: () => setActiveTab("students"),      color: "#f59e0b", bg: "#fffbeb", key: "students" },
            { icon: Settings,   label: "Configuración",     desc: "Ajusta tu perfil",                action: () => setActiveTab("settings"),      color: "#64748b", bg: "#f8fafc", key: "settings" },
          ].map(({ icon: Icon, label, desc, action, color, bg, key }) => (
            <Col key={key} xs={6} md={3}>
              <button
                className="btn w-100 text-start p-3 p-md-4 border-0 h-100"
                style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "transform 0.18s, box-shadow 0.18s" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "none";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
                }}
                onClick={action}
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
          {/* <div
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
          </div> */}

      </Container>

      {/* Modal de creación */}
      <CreateCursoModal
        show={!!createTarget}
        onHide={closeCreate}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal de edición */}
      <EditCursoModal
        show={!!editTarget}
        onHide={closeEdit}
        curso={editTarget}
        onSuccess={handleEditSuccess}
      />

    </div>
  );
};

export default InstructorDashboard;
