import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onNavigateToRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError('Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #1a1f6e 0%, #1565c0 60%, #1e88e5 100%)' }}
    >
      {/* Decoración */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.08)', top: -120, right: -80 }} />
        <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.06)', bottom: 60, left: -60 }} />
      </div>

      <div className="container" style={{ zIndex: 1, position: 'relative' }}>
        <div className="row justify-content-center">
          <div className="col-12 col-sm-9 col-md-7 col-lg-5 col-xl-4">

            {/* Logo */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center gap-2 mb-3"
                style={{ cursor: 'pointer' }}
                onClick={() => {}}
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
                Bienvenido de nuevo
              </h1>
              <p className="text-white-50 mb-0" style={{ fontSize: '0.9rem' }}>
                Inicia sesión para continuar aprendiendo
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

                <form onSubmit={handleSubmit} noValidate>

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="login-email" className="form-label fw-semibold" style={{ fontSize: '0.875rem', color: '#374151' }}>
                      Correo electrónico
                    </label>
                    <div className="input-group">
                      <span
                        className="input-group-text border-end-0"
                        style={{ background: '#f8faff', borderColor: '#dde3f0', borderRadius: '12px 0 0 12px' }}
                      >
                        <i className="bi bi-envelope text-secondary" />
                      </span>
                      <input
                        id="login-email"
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
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label htmlFor="login-password" className="form-label fw-semibold mb-0" style={{ fontSize: '0.875rem', color: '#374151' }}>
                        Contraseña
                      </label>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none"
                        style={{ fontSize: '0.8rem', color: '#1565c0' }}
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="input-group">
                      <span
                        className="input-group-text border-end-0"
                        style={{ background: '#f8faff', borderColor: '#dde3f0', borderRadius: '12px 0 0 12px' }}
                      >
                        <i className="bi bi-lock text-secondary" />
                      </span>
                      <input
                        id="login-password"
                        type={showPass ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 ps-0"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
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

                  {/* Recuérdame */}
                  <div className="mb-4">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="login-remember" />
                      <label className="form-check-label" htmlFor="login-remember" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Recordar mi sesión
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
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right" />
                        Iniciar sesión
                      </>
                    )}
                  </button>
                </form>

                {/* Divisor */}
                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1 m-0" style={{ borderColor: '#e5e7eb' }} />
                  <span className="px-3 text-muted" style={{ fontSize: '0.8rem' }}>o continúa con</span>
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

                {/* Link a registro */}
                <p className="text-center mt-4 mb-0" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    className="btn btn-link p-0 fw-semibold text-decoration-none align-baseline"
                    style={{ color: '#1565c0', fontSize: '0.875rem' }}
                    onClick={onNavigateToRegister}
                  >
                    Regístrate gratis
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

export default Login;
