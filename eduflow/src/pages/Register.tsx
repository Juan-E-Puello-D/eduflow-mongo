import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Role = 'student' | 'instructor';

interface RegisterProps {
  onNavigateToLogin?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordStrength = (): { label: string; color: string; width: string } => {
    if (!password) return { label: '', color: '#e5e7eb', width: '0%' };
    const score = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length;
    if (score <= 1) return { label: 'Débil',   color: '#ef4444', width: '25%'  };
    if (score === 2) return { label: 'Regular', color: '#f97316', width: '50%'  };
    if (score === 3) return { label: 'Buena',   color: '#eab308', width: '75%'  };
    return               { label: 'Fuerte',  color: '#22c55e', width: '100%' };
  };

  const strength = passwordStrength();
  const passwordsMatch = confirmPassword !== '' && password === confirmPassword;
  const passwordsMismatch = confirmPassword !== '' && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!terms) {
      setError('Debes aceptar los términos y condiciones.');
      return;
    }

    setLoading(true);
    try {
      // TODO: reemplaza con tu llamada real a la API
      // const res = await fetch('/api/auth/register', { method: 'POST', ... });
      // const data = await res.json();
      // login(data.user.name, data.user.role);

      setSuccess(true);
    } catch {
      setError('No se pudo crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito
  if (success) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: 'linear-gradient(135deg, #1a1f6e 0%, #1565c0 60%, #1e88e5 100%)' }}
      >
        <div className="text-center text-white px-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
            style={{ width: 80, height: 80, background: 'rgba(34,197,94,0.2)', border: '2px solid rgba(34,197,94,0.5)' }}
          >
            <i className="bi bi-check-lg" style={{ fontSize: 36 }} />
          </div>
          <h2 className="fw-bold mb-2">¡Cuenta creada!</h2>
          <p className="text-white-50 mb-4">Ya puedes empezar a aprender en EduFlow.</p>
          <button
            type="button"
            className="btn text-white fw-semibold px-4"
            style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => { login(name, role); }}
          >
            <i className="bi bi-house me-2" />
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{ background: 'linear-gradient(135deg, #1a1f6e 0%, #1565c0 60%, #1e88e5 100%)' }}
    >
      {/* Decoración */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.07)', top: -100, right: -60 }} />
        <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.05)', bottom: 40, left: -50 }} />
      </div>

      <div className="container" style={{ zIndex: 1, position: 'relative' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">

            {/* Logo */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center gap-2 mb-3"
                style={{ cursor: 'pointer' }}
                onClick={() => { login(name, role); }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-3"
                  style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                >
                  <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: 20 }} />
                </div>
                <span className="fw-bold fs-4 text-white">EduFlow</span>
              </div>
              <h1 className="text-white fw-bold mb-1" style={{ fontSize: '1.6rem' }}>
                Crea tu cuenta
              </h1>
              <p className="text-white-50 mb-0" style={{ fontSize: '0.9rem' }}>
                Únete a miles de estudiantes en EduFlow
              </p>
            </div>

            {/* Card */}
            <div className="card border-0 shadow-lg" style={{ borderRadius: 20 }}>
              <div className="card-body p-4 p-md-5">

                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" role="alert" style={{ borderRadius: 10, fontSize: '0.875rem' }}>
                    <i className="bi bi-exclamation-circle-fill flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Selector de rol */}
                <div className="mb-4">
                  <label className="form-label fw-semibold d-block" style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Quiero unirme como
                  </label>
                  <div className="d-flex gap-2">
                    {(['student', 'instructor'] as Role[]).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className="btn flex-fill d-flex flex-column align-items-center gap-1 py-3"
                        style={{
                          borderRadius: 14,
                          border: role === r ? '2px solid #1565c0' : '1.5px solid #e5e7eb',
                          background: role === r ? '#eff6ff' : '#f9fafb',
                          color: role === r ? '#1565c0' : '#6b7280',
                          transition: 'all 0.15s',
                        }}
                      >
                        <i
                          className={`bi ${r === 'student' ? 'bi-person-arms-up' : 'bi-person-badge'}`}
                          style={{ fontSize: 22 }}
                        />
                        <span className="fw-semibold" style={{ fontSize: '0.82rem' }}>
                          {r === 'student' ? 'Estudiante' : 'Instructor'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>

                  {/* Nombre */}
                  <div className="mb-3">
                    <label htmlFor="reg-name" className="form-label fw-semibold" style={{ fontSize: '0.875rem', color: '#374151' }}>
                      Nombre completo
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0" style={{ background: '#f8faff', borderColor: '#dde3f0', borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-person text-secondary" />
                      </span>
                      <input
                        id="reg-name"
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Ana Gómez"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoComplete="name"
                        style={{ background: '#f8faff', borderColor: '#dde3f0', borderRadius: '0 12px 12px 0', fontSize: '0.9rem', boxShadow: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="reg-email" className="form-label fw-semibold" style={{ fontSize: '0.875rem', color: '#374151' }}>
                      Correo electrónico
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0" style={{ background: '#f8faff', borderColor: '#dde3f0', borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-envelope text-secondary" />
                      </span>
                      <input
                        id="reg-email"
                        type="email"
                        className="form-control border-start-0 ps-0"
                        placeholder="correo@ejemplo.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                        style={{ background: '#f8faff', borderColor: '#dde3f0', borderRadius: '0 12px 12px 0', fontSize: '0.9rem', boxShadow: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="mb-2">
                    <label htmlFor="reg-password" className="form-label fw-semibold" style={{ fontSize: '0.875rem', color: '#374151' }}>
                      Contraseña
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0" style={{ background: '#f8faff', borderColor: '#dde3f0', borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-lock text-secondary" />
                      </span>
                      <input
                        id="reg-password"
                        type={showPass ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 ps-0"
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="new-password"
                        style={{ background: '#f8faff', borderColor: '#dde3f0', fontSize: '0.9rem', boxShadow: 'none' }}
                      />
                      <button
                        type="button"
                        className="input-group-text border-start-0"
                        onClick={() => setShowPass(v => !v)}
                        style={{ background: '#f8faff', borderColor: '#dde3f0', borderRadius: '0 12px 12px 0', cursor: 'pointer' }}
                        aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        <i className={`bi bi-eye${showPass ? '-slash' : ''} text-secondary`} />
                      </button>
                    </div>
                  </div>

                  {/* Barra de fortaleza */}
                  {password && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Fortaleza</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: strength.color }}>{strength.label}</span>
                      </div>
                      <div style={{ height: 4, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'width 0.3s, background 0.3s', borderRadius: 99 }} />
                      </div>
                    </div>
                  )}

                  {/* Confirmar contraseña */}
                  <div className="mb-3">
                    <label htmlFor="reg-confirm" className="form-label fw-semibold" style={{ fontSize: '0.875rem', color: '#374151' }}>
                      Confirmar contraseña
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0" style={{ background: '#f8faff', borderColor: '#dde3f0', borderRadius: '12px 0 0 12px' }}>
                        <i className="bi bi-shield-lock text-secondary" />
                      </span>
                      <input
                        id="reg-confirm"
                        type={showConfirm ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 ps-0"
                        placeholder="Repite tu contraseña"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        style={{
                          background: '#f8faff',
                          borderColor: passwordsMismatch ? '#ef4444' : '#dde3f0',
                          fontSize: '0.9rem',
                          boxShadow: 'none',
                        }}
                      />
                      <button
                        type="button"
                        className="input-group-text border-start-0"
                        onClick={() => setShowConfirm(v => !v)}
                        style={{
                          background: '#f8faff',
                          borderColor: passwordsMismatch ? '#ef4444' : '#dde3f0',
                          borderRadius: '0 12px 12px 0',
                          cursor: 'pointer',
                        }}
                        aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        <i className={`bi bi-eye${showConfirm ? '-slash' : ''} text-secondary`} />
                      </button>
                    </div>
                    {passwordsMismatch && (
                      <p className="mt-1 mb-0" style={{ fontSize: '0.78rem', color: '#ef4444' }}>
                        <i className="bi bi-x-circle me-1" />Las contraseñas no coinciden
                      </p>
                    )}
                    {passwordsMatch && (
                      <p className="mt-1 mb-0" style={{ fontSize: '0.78rem', color: '#22c55e' }}>
                        <i className="bi bi-check-circle me-1" />Las contraseñas coinciden
                      </p>
                    )}
                  </div>

                  {/* Términos */}
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="reg-terms"
                        checked={terms}
                        onChange={e => setTerms(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="reg-terms" style={{ fontSize: '0.83rem', color: '#6b7280' }}>
                        Acepto los{' '}
                        <button type="button" className="btn btn-link p-0 align-baseline text-decoration-none fw-semibold" style={{ color: '#1565c0', fontSize: '0.83rem' }}>
                          Términos de servicio
                        </button>
                        {' '}y la{' '}
                        <button type="button" className="btn btn-link p-0 align-baseline text-decoration-none fw-semibold" style={{ color: '#1565c0', fontSize: '0.83rem' }}>
                          Política de privacidad
                        </button>
                      </label>
                    </div>
                  </div>

                  {/* Botón submit */}
                  <button
                    type="submit"
                    className="btn w-100 text-white fw-semibold d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(90deg, #1565c0, #1e88e5)',
                      border: 'none',
                      borderRadius: 12,
                      padding: '12px',
                      fontSize: '0.95rem',
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus-fill" />
                        Crear cuenta gratis
                      </>
                    )}
                  </button>
                </form>

                {/* Divisor */}
                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1 m-0" style={{ borderColor: '#e5e7eb' }} />
                  <span className="px-3 text-muted" style={{ fontSize: '0.8rem' }}>o regístrate con</span>
                  <hr className="flex-grow-1 m-0" style={{ borderColor: '#e5e7eb' }} />
                </div>

                {/* Botones sociales */}
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-fill d-flex align-items-center justify-content-center gap-2"
                    style={{ borderRadius: 12, fontSize: '0.875rem', padding: '10px' }}
                  >
                    <i className="bi bi-google" />
                    Google
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-fill d-flex align-items-center justify-content-center gap-2"
                    style={{ borderRadius: 12, fontSize: '0.875rem', padding: '10px' }}
                  >
                    <i className="bi bi-github" />
                    GitHub
                  </button>
                </div>

                {/* Link a login */}
                <p className="text-center mt-4 mb-0" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  ¿Ya tienes una cuenta?{' '}
                  <button
                    type="button"
                    className="btn btn-link p-0 fw-semibold text-decoration-none align-baseline"
                    style={{ color: '#1565c0', fontSize: '0.875rem' }}
                    onClick={onNavigateToLogin}
                  >
                    Inicia sesión
                  </button>
                </p>

              </div>
            </div>

            <p className="text-center mt-3 text-white-50" style={{ fontSize: '0.78rem' }}>
              © {new Date().getFullYear()} EduFlow. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
