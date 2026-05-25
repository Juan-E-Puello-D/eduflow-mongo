import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { User, Mail, Calendar, Shield, Edit3, Check, X, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getCursos, getCursoById } from "../services/cursosService";
import { getInscripciones } from "../services/inscripcionesService";
import { getComentarios } from "../services/comentariosService";

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);
  const [studentStats, setStudentStats] = useState({ cursosEnProgreso: 0, cursosCompletados: 0, horasAprendizaje: 0 });
  const [instructorStats, setInstructorStats] = useState({ cursosCreados: 0, estudiantesTotales: 0, valoracionMedia: "Sin calificaciones" });

  if (!user) return null;

  const initials = user.nombre
    ? user.nombre.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const joinDate = new Date(user.fechaRegistro).toLocaleDateString("es-ES", {
    year: "numeric", month: "long", day: "numeric",
  });

  const handleSave = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await updateProfile({ nombre: nombre.trim() });
      setSaveOk(true);
      setEditing(false);
      setTimeout(() => setSaveOk(false), 3000);
    } catch {
      setSaveError("No se pudo actualizar el perfil. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNombre(user.nombre);
    setEditing(false);
    setSaveError("");
  };

  const isInstructor = user.rol === "instructor";

  useEffect(() => {
    if (!user) return;
    let active = true;

    const loadStats = async () => {
      try {
        if (isInstructor) {
          const cursos = await getCursos({ instructorId: user._id });
          const inscripciones = await getInscripciones();
          const myEnrollments = inscripciones.filter(i => cursos.some(c => c._id === i.cursoId));
          const uniqueStudents = new Set(myEnrollments.map(i => i.usuarioId));
          const comentarios = await getComentarios();
          const ratings = comentarios
            .filter(c => cursos.some(curso => curso._id === c.cursoId) && typeof c.calificacion === "number")
            .map(c => c.calificacion as number);
          const averageRating = ratings.length
            ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
            : null;

          if (!active) return;
          setInstructorStats({
            cursosCreados: cursos.length,
            estudiantesTotales: uniqueStudents.size,
            valoracionMedia: averageRating ? `${averageRating.toFixed(1)}★` : "Sin calificaciones",
          });
        } else {
          const inscripciones = await getInscripciones({ usuarioId: user._id });
          const resolved = await Promise.all(
            inscripciones.map(async (ins) => ({
              curso: await getCursoById(ins.cursoId),
              inscripcion: ins,
            }))
          );

          const cursosEnProgreso = resolved.filter(({ inscripcion }) => inscripcion.porcentajeProgreso > 0 && inscripcion.porcentajeProgreso < 100).length;
          const cursosCompletados = resolved.filter(({ inscripcion }) => inscripcion.porcentajeProgreso >= 100).length;
          const totalMinutes = resolved.reduce(
            (sum, { curso, inscripcion }) => sum + curso.duracionTotal * (inscripcion.porcentajeProgreso / 100),
            0
          );
          const horasAprendizaje = Math.round(totalMinutes / 60);

          if (!active) return;
          setStudentStats({ cursosEnProgreso, cursosCompletados, horasAprendizaje });
        }
      } catch {
        // Si falla la carga de métricas, mantenemos los valores a cero.
      }
    };

    loadStats();
    return () => { active = false; };
  }, [user, isInstructor]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* Header */}
      <div
        style={{
          background: isInstructor
            ? "linear-gradient(135deg, #1a1f2e 0%, #2d1b69 50%, #4c1d95 100%)"
            : "linear-gradient(135deg, #1a1f6e 0%, #1565c0 60%, #1e88e5 100%)",
          padding: "48px 0 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.07)", top: -100, right: -60, pointerEvents: "none" }} />
        <Container style={{ position: "relative", zIndex: 1 }}>
          <h1 className="text-white fw-bold mb-1" style={{ fontSize: "1.6rem" }}>Mi perfil</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: 0 }}>
            Gestiona tu información personal
          </p>
        </Container>
      </div>

      <Container style={{ marginTop: -50 }}>
        <Row className="g-4">

          {/* Tarjeta de perfil */}
          <Col lg={4}>
            <Card className="border-0 text-center" style={{ borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <Card.Body className="p-4 p-md-5">
                {/* Avatar */}
                <div className="position-relative d-inline-block mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold mx-auto"
                    style={{
                      width: 90, height: 90,
                      background: isInstructor
                        ? "linear-gradient(135deg,#7c3aed,#8b5cf6)"
                        : "linear-gradient(135deg,#1565c0,#1e88e5)",
                      color: "white", fontSize: "2rem",
                    }}
                  >
                    {initials}
                  </div>
                  <button
                    className="btn d-flex align-items-center justify-content-center rounded-circle position-absolute"
                    style={{ width: 30, height: 30, background: "white", border: "2px solid #e2e8f0", bottom: 0, right: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", padding: 0 }}
                    title="Cambiar foto"
                  >
                    <Camera size={14} style={{ color: "#64748b" }} />
                  </button>
                </div>

                <h4 className="fw-bold mb-1" style={{ color: "#0f172a" }}>{user.nombre}</h4>
                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{
                    background: isInstructor ? "#f5f3ff" : "#eff6ff",
                    color: isInstructor ? "#7c3aed" : "#1565c0",
                    fontSize: "0.75rem", fontWeight: 600,
                  }}
                >
                  {isInstructor ? "INSTRUCTOR" : "ESTUDIANTE"}
                </span>

                <hr className="my-4" style={{ borderColor: "#f1f5f9" }} />

                {/* Info rápida */}
                <div className="text-start">
                  {[
                    { icon: Mail,     label: "Correo",       value: user.email },
                    { icon: Calendar, label: "Miembro desde", value: joinDate },
                    { icon: Shield,   label: "Rol",          value: isInstructor ? "Instructor" : "Estudiante" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="d-flex align-items-start gap-3 mb-3">
                      <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                        style={{ width: 34, height: 34, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <Icon size={14} style={{ color: "#64748b" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
                        <div style={{ fontSize: "0.875rem", color: "#0f172a", fontWeight: 500, wordBreak: "break-word" }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Información editable */}
          <Col lg={8}>
            <Card className="border-0" style={{ borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <Card.Body className="p-4 p-md-5">

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Información personal</h5>
                    <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>Actualiza tus datos de perfil</p>
                  </div>
                  {!editing && (
                    <button
                      className="btn d-flex align-items-center gap-2 rounded-pill px-3 py-2 fw-semibold"
                      style={{ background: isInstructor ? "#f5f3ff" : "#eff6ff", color: isInstructor ? "#7c3aed" : "#1565c0", border: "none", fontSize: "0.875rem" }}
                      onClick={() => setEditing(true)}
                    >
                      <Edit3 size={14} /> Editar
                    </button>
                  )}
                </div>

                {saveOk && (
                  <div className="alert d-flex align-items-center gap-2 py-2 mb-4" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, color: "#16a34a", fontSize: "0.875rem" }}>
                    <Check size={16} /> Perfil actualizado correctamente.
                  </div>
                )}
                {saveError && (
                  <div className="alert d-flex align-items-center gap-2 py-2 mb-4" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#dc2626", fontSize: "0.875rem" }}>
                    <X size={16} /> {saveError}
                  </div>
                )}

                {/* Campo nombre */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: "0.875rem", color: "#374151" }}>
                    <User size={14} className="me-2" />
                    Nombre completo
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      style={{ borderRadius: 12, borderColor: "#dde3f0", background: "#f8faff", fontSize: "0.9rem", boxShadow: "none" }}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="rounded-3 px-3 py-3"
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "#0f172a" }}
                    >
                      {user.nombre}
                    </div>
                  )}
                </div>

                {/* Campo email (solo lectura) */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: "0.875rem", color: "#374151" }}>
                    <Mail size={14} className="me-2" />
                    Correo electrónico
                    <span className="ms-2 badge rounded-pill" style={{ background: "#f1f5f9", color: "#64748b", fontSize: "0.65rem", fontWeight: 600 }}>Solo lectura</span>
                  </label>
                  <div
                    className="rounded-3 px-3 py-3"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "#64748b" }}
                  >
                    {user.email}
                  </div>
                </div>

                {/* Idioma preferido (solo lectura) */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: "0.875rem", color: "#374151" }}>
                    Idioma preferido
                  </label>
                  <div
                    className="rounded-3 px-3 py-3"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "0.9rem", color: "#0f172a" }}
                  >
                    {user.preferencias?.idioma === "es" ? "🇪🇸 Español" : "🇺🇸 English"}
                  </div>
                </div>

                {/* Botones de acción */}
                {editing && (
                  <div className="d-flex gap-3 mt-2">
                    <button
                      className="btn fw-semibold d-flex align-items-center gap-2 px-4 rounded-pill"
                      style={{
                        background: isInstructor
                          ? "linear-gradient(90deg,#7c3aed,#8b5cf6)"
                          : "linear-gradient(90deg,#1565c0,#1e88e5)",
                        border: "none", color: "white", fontSize: "0.9rem",
                      }}
                      disabled={saving || !nombre.trim()}
                      onClick={handleSave}
                    >
                      {saving ? (
                        <><span className="spinner-border spinner-border-sm" /> Guardando...</>
                      ) : (
                        <><Check size={15} /> Guardar cambios</>
                      )}
                    </button>
                    <button
                      className="btn fw-semibold d-flex align-items-center gap-2 px-4 rounded-pill"
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: "0.9rem" }}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X size={15} /> Cancelar
                    </button>
                  </div>
                )}

              </Card.Body>
            </Card>

            {/* Estadísticas del usuario */}
            <Card className="border-0 mt-4" style={{ borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
              <Card.Body className="p-4 p-md-5">
                <h5 className="fw-bold mb-4" style={{ color: "#0f172a" }}>
                  {isInstructor ? "Tu actividad como instructor" : "Tu actividad como estudiante"}
                </h5>
                <Row className="g-3">
                  {(
                    isInstructor ? [
                      { label: "Cursos creados",    value: instructorStats.cursosCreados,     color: "#7c3aed", bg: "#f5f3ff" },
                      { label: "Estudiantes totales", value: instructorStats.estudiantesTotales, color: "#f59e0b", bg: "#fffbeb" },
                      { label: "Valoración media",   value: instructorStats.valoracionMedia,  color: "#22c55e", bg: "#f0fdf4" },
                    ] : [
                      { label: "Cursos en progreso",  value: studentStats.cursosEnProgreso,  color: "#3b82f6", bg: "#eff6ff" },
                      { label: "Cursos completados",  value: studentStats.cursosCompletados, color: "#22c55e", bg: "#f0fdf4" },
                      { label: "Horas de aprendizaje", value: `${studentStats.horasAprendizaje} h`, color: "#f59e0b", bg: "#fffbeb" },
                    ]
                  ).map(({ label, value, color, bg }) => (
                    <Col key={label} xs={4}>
                      <div className="text-center rounded-3 p-3" style={{ background: bg }}>
                        <div className="fw-bold" style={{ color, fontSize: "1.4rem" }}>{value}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>{label}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>

        </Row>
      </Container>
    </div>
  );
};

export default Profile;
