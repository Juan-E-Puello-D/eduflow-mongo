import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Modal, Form } from "react-bootstrap";
import {
  Users, BookOpen, Star, PlusCircle,
  Settings, TrendingUp, Eye,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { CourseCard } from "../../components/CourseCardShared";
import { getCursos, updateCurso } from "../../services/cursosService";
import { getInscripciones } from "../../services/inscripcionesService";
import type { Curso } from "../../types/models";

interface EditForm {
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: "Básico" | "Intermedio" | "Avanzado";
  precio: number;
  publicado: boolean;
}

const NIVELES = ["Básico", "Intermedio", "Avanzado"] as const;
const CATEGORIAS = ["React", "MongoDB", "Fullstack", "JavaScript", "Node", "CSS", "Python", "TypeScript", "Otro"];

const InstructorDashboard: React.FC = () => {
  const { user, setActiveTab } = useAuth();
  const [courses, setCourses] = useState<Curso[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [courseStudents, setCourseStudents] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editTarget, setEditTarget] = useState<Curso | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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

  const openEdit = (curso: Curso) => {
    setEditTarget(curso);
    setEditForm({
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      categoria: curso.categoria ?? "",
      nivel: curso.nivel ?? "Básico",
      precio: curso.precio ?? 0,
      publicado: curso.publicado,
    });
    setSaveError("");
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditForm(null);
    setSaveError("");
  };

  const handleSave = async () => {
    if (!editTarget || !editForm) return;
    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateCurso(editTarget._id, editForm);
      setCourses(prev => prev.map(c => c._id === updated._id ? updated : c));
      closeEdit();
    } catch {
      setSaveError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
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
            {courses.map(curso => (
              <Col key={curso._id} md={6} lg={4}>
                <CourseCard
                  course={curso}
                  rating={4.8}
                  students={courseStudents[curso._id] ?? 0}
                  onDetail={() => setActiveTab("analytics")}
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
            { icon: PlusCircle, label: "Crear curso",       desc: "Añade nuevo contenido",          tab: "create-course", color: "#7c3aed", bg: "#f5f3ff" },
            { icon: TrendingUp, label: "Analíticas",        desc: "Visualiza el rendimiento",        tab: "analytics",     color: "#3b82f6", bg: "#eff6ff" },
            { icon: Users,      label: "Mis estudiantes",   desc: `${totalStudents} en total`,       tab: "students",      color: "#f59e0b", bg: "#fffbeb" },
            { icon: Settings,   label: "Configuración",     desc: "Ajusta tu perfil",                tab: "settings",      color: "#64748b", bg: "#f8fafc" },
          ].map(({ icon: Icon, label, desc, tab, color, bg }) => (
            <Col key={tab} xs={6} md={3}>
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

      {/* Modal de edición */}
      <Modal show={!!editTarget} onHide={closeEdit} centered size="lg">
        <Modal.Header closeButton style={{ borderBottom: "1px solid #ede9fe" }}>
          <Modal.Title style={{ fontWeight: 700, color: "#1e1b4b", fontSize: "1.1rem" }}>
            Editar curso
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          {editForm && (
            <Form>
              <Row className="g-3">
                <Col xs={12}>
                  <Form.Label className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                    Título
                  </Form.Label>
                  <Form.Control
                    value={editForm.titulo}
                    onChange={e => setEditForm(f => f && ({ ...f, titulo: e.target.value }))}
                    style={{ borderRadius: 10, fontSize: "0.9rem" }}
                    placeholder="Título del curso"
                  />
                </Col>

                <Col xs={12}>
                  <Form.Label className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                    Descripción
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editForm.descripcion}
                    onChange={e => setEditForm(f => f && ({ ...f, descripcion: e.target.value }))}
                    style={{ borderRadius: 10, fontSize: "0.9rem", resize: "vertical" }}
                    placeholder="Describe de qué trata el curso"
                  />
                </Col>

                <Col xs={12} sm={6}>
                  <Form.Label className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                    Categoría
                  </Form.Label>
                  <Form.Select
                    value={editForm.categoria}
                    onChange={e => setEditForm(f => f && ({ ...f, categoria: e.target.value }))}
                    style={{ borderRadius: 10, fontSize: "0.9rem" }}
                  >
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
                </Col>

                <Col xs={12} sm={6}>
                  <Form.Label className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                    Nivel
                  </Form.Label>
                  <Form.Select
                    value={editForm.nivel}
                    onChange={e => setEditForm(f => f && ({ ...f, nivel: e.target.value as EditForm["nivel"] }))}
                    style={{ borderRadius: 10, fontSize: "0.9rem" }}
                  >
                    {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                  </Form.Select>
                </Col>

                <Col xs={12} sm={6}>
                  <Form.Label className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                    Precio (USD)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    step={0.01}
                    value={editForm.precio}
                    onChange={e => setEditForm(f => f && ({ ...f, precio: parseFloat(e.target.value) || 0 }))}
                    style={{ borderRadius: 10, fontSize: "0.9rem" }}
                  />
                </Col>

                <Col xs={12} sm={6} className="d-flex align-items-end">
                  <Form.Check
                    type="switch"
                    id="publicado-switch"
                    label={editForm.publicado ? "Publicado" : "Borrador"}
                    checked={editForm.publicado}
                    onChange={e => setEditForm(f => f && ({ ...f, publicado: e.target.checked }))}
                    style={{ fontSize: "0.9rem" }}
                    className="mb-2"
                  />
                </Col>
              </Row>

              {saveError && (
                <div className="alert alert-danger rounded-3 mt-3 mb-0" style={{ fontSize: "0.85rem" }}>
                  {saveError}
                </div>
              )}
            </Form>
          )}
        </Modal.Body>

        <Modal.Footer style={{ borderTop: "1px solid #ede9fe" }}>
          <button
            className="btn rounded-pill px-4"
            style={{ border: "1.5px solid #e5e7eb", color: "#6b7280", fontSize: "0.875rem" }}
            onClick={closeEdit}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className="btn rounded-pill px-4 fw-semibold text-white"
            style={{ background: "linear-gradient(90deg,#7c3aed,#8b5cf6)", border: "none", fontSize: "0.875rem", minWidth: 100 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <><Spinner size="sm" animation="border" className="me-2" />Guardando…</> : "Guardar cambios"}
          </button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default InstructorDashboard;
