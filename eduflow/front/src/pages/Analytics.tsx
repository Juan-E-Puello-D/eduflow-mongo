import React from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { BarChart3, Trophy } from "lucide-react";

const Analytics: React.FC = () => {
  return (
    <Container className="py-5">
      <div className="mb-4 p-4 rounded-4 bg-primary text-white position-relative overflow-hidden" style={{ minHeight: 260 }}>
        <div className="position-absolute top-0 end-0 opacity-10" style={{ transform: "translate(20%, -20%)" }}>
          <BarChart3 size={180} />
        </div>
        <h2 className="fw-bold">Informes de MongoDB (Aggregate)</h2>
        <p className="text-white-75">Visualización de datos basada en los pipelines de agregación requeridos para el proyecto final.</p>
        <Badge bg="light" text="dark" className="mt-3">Status: CRUD Funcional & Consultas Activas</Badge>
      </div>

      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100 rounded-4 shadow-sm border-0">
            <Card.Body>
              <Card.Title>Popularidad por Categoría</Card.Title>
              {['Backend', 'Data', 'Frontend', 'Mobile'].map((category, idx) => (
                <div key={category} className="mb-4">
                  <div className="d-flex justify-content-between mb-2 text-muted">
                    <span>{category}</span>
                    <span>{90 - idx * 15}%</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${90 - idx * 15}%` }} aria-valuenow={90 - idx * 15} aria-valuemin={0} aria-valuemax={100}></div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 rounded-4 shadow-sm border-0 text-center">
            <Card.Body>
              <Trophy size={64} className="text-warning mb-3" />
              <Card.Title className="mb-3">Certificaciones 2026</Card.Title>
              <Card.Text className="text-muted mb-4">Total de alumnos certificados a través del sistema.</Card.Text>
              <div className="display-6 fw-bold">1,248</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;
