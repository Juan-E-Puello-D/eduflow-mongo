import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Alert } from "react-bootstrap";
import { BarChart3, Trophy, Users, BookOpen, TrendingUp } from "lucide-react";
import { getAnalyticsResumen, type AnalyticsResumen } from "../services/analyticsService";

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalyticsResumen()
      .then(setData)
      .catch(() => setError("No se pudieron cargar las estadísticas."))
      .finally(() => setLoading(false));
  }, []);

  const maxEstudiantes = data
    ? Math.max(...data.popularidad_por_categoria.map((c) => c.totalEstudiantes), 1)
    : 1;

  return (
    <Container className="py-5">
      <div
        className="mb-4 p-4 rounded-4 bg-primary text-white position-relative overflow-hidden"
        style={{ minHeight: 260 }}
      >
        <div
          className="position-absolute top-0 end-0 opacity-10"
          style={{ transform: "translate(20%, -20%)" }}
        >
          <BarChart3 size={180} />
        </div>
        <h2 className="fw-bold">Informes de MongoDB (Aggregate)</h2>
        <p className="text-white-75">
          Visualización de datos basada en los pipelines de agregación requeridos para el proyecto
          final.
        </p>
        <Badge bg="light" text="dark" className="mt-3">
          Status: CRUD Funcional & Consultas Activas
        </Badge>
      </div>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Cargando estadísticas desde MongoDB…</p>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {data && (
        <>
          {/* KPI cards */}
          <Row className="g-3 mb-4">
            <Col sm={6} lg={3}>
              <Card className="rounded-4 shadow-sm border-0 text-center h-100">
                <Card.Body className="py-4">
                  <Users size={32} className="text-primary mb-2" />
                  <div className="display-6 fw-bold">{data.total_estudiantes}</div>
                  <div className="text-muted small mt-1">Estudiantes activos</div>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} lg={3}>
              <Card className="rounded-4 shadow-sm border-0 text-center h-100">
                <Card.Body className="py-4">
                  <BookOpen size={32} className="text-success mb-2" />
                  <div className="display-6 fw-bold">{data.total_cursos_publicados}</div>
                  <div className="text-muted small mt-1">Cursos publicados</div>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} lg={3}>
              <Card className="rounded-4 shadow-sm border-0 text-center h-100">
                <Card.Body className="py-4">
                  <Trophy size={32} className="text-warning mb-2" />
                  <div className="display-6 fw-bold">{data.total_certificaciones}</div>
                  <div className="text-muted small mt-1">Certificaciones</div>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={6} lg={3}>
              <Card className="rounded-4 shadow-sm border-0 text-center h-100">
                <Card.Body className="py-4">
                  <TrendingUp size={32} className="text-info mb-2" />
                  <div className="display-6 fw-bold">{data.promedio_progreso}%</div>
                  <div className="text-muted small mt-1">Progreso promedio</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts row */}
          <Row className="g-4">
            <Col md={6}>
              <Card className="h-100 rounded-4 shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="mb-4">Popularidad por Categoría</Card.Title>
                  {data.popularidad_por_categoria.length === 0 ? (
                    <p className="text-muted">Sin datos de categorías aún.</p>
                  ) : (
                    data.popularidad_por_categoria.map((cat) => {
                      const pct = Math.round((cat.totalEstudiantes / maxEstudiantes) * 100);
                      return (
                        <div key={cat.categoria} className="mb-4">
                          <div className="d-flex justify-content-between mb-1 text-muted">
                            <span>{cat.categoria}</span>
                            <span>
                              {cat.totalEstudiantes} estudiante
                              {cat.totalEstudiantes !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="progress" style={{ height: 8 }}>
                            <div
                              className="progress-bar bg-primary"
                              role="progressbar"
                              style={{ width: `${pct}%` }}
                              aria-valuenow={pct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="h-100 rounded-4 shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="mb-4">Detalle por Categoría</Card.Title>
                  {data.popularidad_por_categoria.length === 0 ? (
                    <p className="text-muted">Sin datos aún.</p>
                  ) : (
                    <table className="table table-sm table-borderless align-middle">
                      <thead className="text-muted">
                        <tr>
                          <th>Categoría</th>
                          <th className="text-end">Cursos</th>
                          <th className="text-end">Estudiantes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.popularidad_por_categoria.map((cat, i) => (
                          <tr key={cat.categoria}>
                            <td>
                              <span
                                className="badge rounded-pill me-2"
                                style={{
                                  background: ["#0d6efd", "#198754", "#ffc107", "#0dcaf0", "#6f42c1"][
                                    i % 5
                                  ],
                                }}
                              >
                                {i + 1}
                              </span>
                              {cat.categoria}
                            </td>
                            <td className="text-end">{cat.totalCursos}</td>
                            <td className="text-end fw-semibold">{cat.totalEstudiantes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Analytics;
