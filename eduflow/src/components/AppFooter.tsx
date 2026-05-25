import React from "react";
import { Container } from "react-bootstrap";
import { GraduationCap } from "lucide-react";

const AppFooter: React.FC = () => (
  <footer className="bg-white border-top py-4">
    <Container className="text-center">
      <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
        <GraduationCap size={20} className="text-primary" />
        <span className="fw-bold">EduFlow</span>
      </div>
      <p className="text-muted mb-0">© 2026 Proyecto Final Electiva IV - Comfenalco. MongoDB & React LMS.</p>
    </Container>
  </footer>
);

export default AppFooter;
