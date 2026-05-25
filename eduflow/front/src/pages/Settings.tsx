import React, { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Globe, Moon, Sun, Lock, Bell, Trash2, Check, X, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateUsuario } from "../services/usuariosService";
import api from "../services/api";

const Settings: React.FC = () => {
  const { user, updateUser, logout } = useAuth();

  const [idioma, setIdioma] = useState<"es" | "en">(user?.preferencias?.idioma ?? "es");
  const [modoOscuro, setModoOscuro] = useState(user?.preferencias?.modoOscuro ?? false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsOk, setPrefsOk] = useState(false);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passOk, setPassOk] = useState(false);

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifProgress, setNotifProgress] = useState(true);
  const [notifNewCourse, setNotifNewCourse] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) return null;

  const isInstructor = user.rol === "instructor";

  const accentColor = isInstructor ? "#7c3aed" : "#1565c0";
  const accentGrad = isInstructor
    ? "linear-gradient(90deg,#7c3aed,#8b5cf6)"
    : "linear-gradient(90deg,#1565c0,#1e88e5)";

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      const updated = await updateUsuario(user._id, {
        preferencias: { idioma, modoOscuro },
      });
      updateUser(updated);
      setPrefsOk(true);
      setTimeout(() => setPrefsOk(false), 3000);
    } catch {
      // silently fail
    } finally {
      setSavingPrefs(false);
    }
  };

  const changePassword = async () => {
    setPassError("");
    if (!currentPass || !newPass || !confirmPass) {
      setPassError("Completa todos los campos.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (newPass.length < 8) {
      setPassError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setPassLoading(true);
    try {
      await api.post("/auth/change-password", { currentPassword: currentPass, newPassword: newPass });
      setPassOk(true);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => setPassOk(false), 4000);
    } catch {
      setPassError("Contraseña actual incorrecta.");
    } finally {
      setPassLoading(false);
    }
  };

  const SectionCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
    <Card className="border-0 mb-4" style={{ borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
      <Card.Body className="p-4 p-md-5">
        <div className="mb-4">
          <h5 className="fw-bold mb-0" style={{ color: "#0f172a" }}>{title}</h5>
          {subtitle && <p className="text-muted mb-0" style={{ fontSize: "0.85rem", marginTop: 2 }}>{subtitle}</p>}
        </div>
        {children}
      </Card.Body>
    </Card>
  );

  const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }> = ({ checked, onChange, label, desc }) => (
    <div className="d-flex align-items-center justify-content-between py-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
      <div>
        <div className="fw-semibold" style={{ fontSize: "0.9rem", color: "#0f172a" }}>{label}</div>
        {desc && <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 2 }}>{desc}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
          background: checked ? accentColor : "#e2e8f0",
          position: "relative", transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute", top: 3, left: checked ? 23 : 3,
            width: 18, height: 18, borderRadius: "50%", background: "white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* Header */}
      <div
        style={{
          background: isInstructor
            ? "linear-gradient(135deg, #1a1f2e 0%, #2d1b69 50%, #4c1d95 100%)"
            : "linear-gradient(135deg, #1a1f6e 0%, #1565c0 60%, #1e88e5 100%)",
          padding: "48px 0 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.07)", top: -90, right: -50, pointerEvents: "none" }} />
        <Container style={{ position: "relative", zIndex: 1 }}>
          <h1 className="text-white fw-bold mb-1" style={{ fontSize: "1.6rem" }}>Configuración</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: 0 }}>
            Personaliza tu experiencia en EduFlow
          </p>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="g-4">
          <Col lg={8}>

            {/* Preferencias de idioma y apariencia */}
            <SectionCard title="Preferencias" subtitle="Idioma y apariencia de la plataforma">

              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: "0.875rem", color: "#374151" }}>
                  <Globe size={14} className="me-2" />Idioma
                </label>
                <div className="d-flex gap-3">
                  {([["es", "🇪🇸 Español"], ["en", "🇺🇸 English"]] as const).map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setIdioma(val)}
                      className="btn flex-fill py-3 fw-semibold"
                      style={{
                        borderRadius: 14,
                        border: idioma === val ? `2px solid ${accentColor}` : "1.5px solid #e5e7eb",
                        background: idioma === val ? (isInstructor ? "#f5f3ff" : "#eff6ff") : "#f9fafb",
                        color: idioma === val ? accentColor : "#6b7280",
                        transition: "all 0.15s",
                        fontSize: "0.9rem",
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <Toggle
                checked={modoOscuro}
                onChange={setModoOscuro}
                label="Modo oscuro"
                desc="Reduce el brillo para mayor comodidad visual"
              />
              <div className="d-flex align-items-center gap-2 mt-1 mb-2 py-2" style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                {modoOscuro ? <Moon size={14} /> : <Sun size={14} />}
                {modoOscuro ? "Modo oscuro activado" : "Modo claro activado"}
              </div>

              {prefsOk && (
                <div className="alert d-flex align-items-center gap-2 py-2 mt-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, color: "#16a34a", fontSize: "0.875rem" }}>
                  <Check size={16} /> Preferencias guardadas correctamente.
                </div>
              )}

              <button
                className="btn fw-semibold d-flex align-items-center gap-2 rounded-pill px-4 mt-3"
                style={{ background: accentGrad, border: "none", color: "white", fontSize: "0.9rem" }}
                onClick={savePreferences}
                disabled={savingPrefs}
              >
                {savingPrefs ? (
                  <><span className="spinner-border spinner-border-sm" /> Guardando...</>
                ) : (
                  <><Check size={15} /> Guardar preferencias</>
                )}
              </button>
            </SectionCard>

            {/* Notificaciones */}
            <SectionCard title="Notificaciones" subtitle="Decide qué comunicaciones deseas recibir">
              <Toggle checked={notifEmail}     onChange={setNotifEmail}     label="Correos informativos"   desc="Resúmenes semanales de tu actividad" />
              <Toggle checked={notifProgress}  onChange={setNotifProgress}  label="Recordatorios de progreso" desc="Te avisamos cuando lleves tiempo sin estudiar" />
              <Toggle checked={notifNewCourse} onChange={setNotifNewCourse} label="Nuevos cursos"           desc="Cuando se publiquen cursos en tus categorías" />
              <button
                className="btn fw-semibold d-flex align-items-center gap-2 rounded-pill px-4 mt-4"
                style={{ background: accentGrad, border: "none", color: "white", fontSize: "0.9rem" }}
              >
                <Bell size={15} /> Guardar notificaciones
              </button>
            </SectionCard>

            {/* Cambiar contraseña */}
            <SectionCard title="Seguridad" subtitle="Cambia tu contraseña de acceso">

              {passOk && (
                <div className="alert d-flex align-items-center gap-2 py-2 mb-4" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, color: "#16a34a", fontSize: "0.875rem" }}>
                  <Check size={16} /> Contraseña actualizada correctamente.
                </div>
              )}
              {passError && (
                <div className="alert d-flex align-items-center gap-2 py-2 mb-4" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#dc2626", fontSize: "0.875rem" }}>
                  <X size={16} /> {passError}
                </div>
              )}

              {[
                { id: "curr", label: "Contraseña actual", val: currentPass, set: setCurrentPass, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                { id: "new",  label: "Nueva contraseña",  val: newPass,     set: setNewPass,     show: showNew,    toggle: () => setShowNew(v => !v) },
                { id: "conf", label: "Confirmar nueva contraseña", val: confirmPass, set: setConfirmPass, show: showNew, toggle: () => setShowNew(v => !v) },
              ].map(({ id, label, val, set, show, toggle }) => (
                <div key={id} className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: "0.875rem", color: "#374151" }}>
                    <Lock size={13} className="me-2" />{label}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text border-end-0" style={{ background: "#f8faff", borderColor: "#dde3f0", borderRadius: "12px 0 0 12px" }}>
                      <Lock size={14} style={{ color: "#94a3b8" }} />
                    </span>
                    <input
                      type={show ? "text" : "password"}
                      className="form-control border-start-0 border-end-0"
                      placeholder="••••••••"
                      value={val}
                      onChange={e => set(e.target.value)}
                      style={{ background: "#f8faff", borderColor: "#dde3f0", fontSize: "0.9rem", boxShadow: "none" }}
                    />
                    <button
                      type="button"
                      className="input-group-text border-start-0"
                      onClick={toggle}
                      style={{ background: "#f8faff", borderColor: "#dde3f0", borderRadius: "0 12px 12px 0", cursor: "pointer" }}
                    >
                      {show ? <EyeOff size={14} style={{ color: "#94a3b8" }} /> : <Eye size={14} style={{ color: "#94a3b8" }} />}
                    </button>
                  </div>
                </div>
              ))}

              <button
                className="btn fw-semibold d-flex align-items-center gap-2 rounded-pill px-4 mt-2"
                style={{ background: accentGrad, border: "none", color: "white", fontSize: "0.9rem" }}
                disabled={passLoading}
                onClick={changePassword}
              >
                {passLoading ? (
                  <><span className="spinner-border spinner-border-sm" /> Actualizando...</>
                ) : (
                  <><Lock size={15} /> Cambiar contraseña</>
                )}
              </button>
            </SectionCard>

            {/* Zona de peligro */}
            <Card className="border-0" style={{ borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #fee2e2 !important" }}>
              <Card.Body className="p-4 p-md-5" style={{ background: "#fff5f5", borderRadius: 20 }}>
                <div className="d-flex align-items-start gap-3 mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: 44, height: 44, background: "#fee2e2" }}>
                    <AlertTriangle size={20} style={{ color: "#dc2626" }} />
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1" style={{ color: "#dc2626" }}>Zona de peligro</h5>
                    <p className="mb-0" style={{ fontSize: "0.85rem", color: "#ef4444" }}>
                      Estas acciones son irreversibles. Procede con precaución.
                    </p>
                  </div>
                </div>

                {showDeleteConfirm ? (
                  <div className="rounded-3 p-4" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                    <p className="fw-semibold mb-1" style={{ color: "#dc2626", fontSize: "0.9rem" }}>¿Estás seguro de que quieres eliminar tu cuenta?</p>
                    <p className="text-muted mb-3" style={{ fontSize: "0.82rem" }}>Se eliminarán todos tus datos, cursos e historial. Esta acción no se puede deshacer.</p>
                    <div className="d-flex gap-3">
                      <button
                        className="btn btn-danger rounded-pill px-4 fw-semibold"
                        style={{ fontSize: "0.875rem" }}
                        onClick={() => { logout(); }}
                      >
                        <Trash2 size={14} className="me-2" />Eliminar cuenta
                      </button>
                      <button
                        className="btn rounded-pill px-4 fw-semibold"
                        style={{ background: "white", border: "1px solid #e2e8f0", color: "#475569", fontSize: "0.875rem" }}
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn d-flex align-items-center gap-2 rounded-pill px-4 fw-semibold"
                    style={{ background: "white", border: "1.5px solid #fca5a5", color: "#dc2626", fontSize: "0.875rem" }}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={15} /> Eliminar mi cuenta
                  </button>
                )}
              </Card.Body>
            </Card>

          </Col>

          {/* Sidebar derecha */}
          <Col lg={4}>
            <Card className="border-0 sticky-top" style={{ borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", top: 80 }}>
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3" style={{ color: "#0f172a" }}>Resumen de cuenta</h6>

                <div className="d-flex align-items-center gap-3 mb-3 rounded-3 p-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
                    style={{
                      width: 44, height: 44,
                      background: isInstructor ? "linear-gradient(135deg,#7c3aed,#8b5cf6)" : "linear-gradient(135deg,#1565c0,#1e88e5)",
                      color: "white", fontSize: "0.9rem",
                    }}
                  >
                    {user.nombre.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-semibold text-truncate" style={{ fontSize: "0.875rem", color: "#0f172a" }}>{user.nombre}</div>
                    <div className="text-truncate" style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{user.email}</div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2" style={{ fontSize: "0.82rem" }}>
                  {[
                    { label: "Tipo de cuenta", value: isInstructor ? "Instructor" : "Estudiante" },
                    { label: "Idioma",          value: idioma === "es" ? "Español" : "English" },
                    { label: "Modo",            value: modoOscuro ? "Oscuro 🌙" : "Claro ☀️" },
                  ].map(({ label, value }) => (
                    <div key={label} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ color: "#64748b" }}>{label}</span>
                      <span className="fw-semibold" style={{ color: "#0f172a" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Settings;
