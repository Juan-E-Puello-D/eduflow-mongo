import React from "react";
import { Container, Button } from "react-bootstrap";
import { LayoutDashboard } from "lucide-react";

const DefaultSection: React.FC<{ activeTab?: string; onBack?: () => void }> = ({ activeTab, onBack }) => (
  <Container className="py-5 text-center">
    <div className="p-5 bg-white rounded-4 shadow-sm">
      <LayoutDashboard size={64} className="text-muted mb-4" />
      <h2 className="fw-bold">Sección en Construcción</h2>
      <p className="text-muted mb-4">Estamos trabajando en los módulos de {activeTab} para integrar el CRUD de MongoDB.</p>
      <Button variant="primary" onClick={onBack}>Volver al inicio</Button>
    </div>
  </Container>
);

export default DefaultSection;
