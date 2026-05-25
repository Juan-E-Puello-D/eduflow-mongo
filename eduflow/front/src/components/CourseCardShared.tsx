import { useState, type FC } from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { PlayCircle, Star, Users, Clock, ArrowRight, BookOpen, Layers } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { Curso } from "../types/models";

export type CourseWithRating = Curso & { rating: number; students: number };

export const categoryColor = (cat: string): string => {
  const map: Record<string, string> = {
    react:      "linear-gradient(135deg,#dbeafe,#bfdbfe)",
    mongodb:    "linear-gradient(135deg,#dcfce7,#bbf7d0)",
    fullstack:  "linear-gradient(135deg,#ede9fe,#ddd6fe)",
    javascript: "linear-gradient(135deg,#fef9c3,#fef08a)",
    node:       "linear-gradient(135deg,#dcfce7,#86efac)",
    css:        "linear-gradient(135deg,#fce7f3,#fbcfe8)",
    python:     "linear-gradient(135deg,#fef3c7,#fde68a)",
    sql:        "linear-gradient(135deg,#e0f2fe,#bae6fd)",
  };
  return map[cat.toLowerCase().replace(/\s+/g, "")] ?? "linear-gradient(135deg,#f1f5f9,#e2e8f0)";
};

export const categoryIconColor = (cat: string): string => {
  const map: Record<string, string> = {
    react:      "#3b82f6",
    mongodb:    "#16a34a",
    fullstack:  "#7c3aed",
    javascript: "#ca8a04",
    node:       "#15803d",
    css:        "#db2777",
    python:     "#d97706",
    sql:        "#0284c7",
  };
  return map[cat.toLowerCase().replace(/\s+/g, "")] ?? "#ffffff";
};

export const SkeletonCard: FC = () => (
  <Card
    className="h-100 border-0 rounded-4 overflow-hidden"
    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
  >
    <div className="bg-light" style={{ height: 160 }} />
    <Card.Body className="p-4">
      <div className="bg-light rounded mb-3" style={{ height: 20, width: "40%" }} />
      <div className="bg-light rounded mb-2" style={{ height: 22, width: "85%" }} />
      <div className="bg-light rounded mb-4" style={{ height: 16, width: "55%" }} />
      <div className="d-flex justify-content-between align-items-center">
        <div className="bg-light rounded" style={{ height: 28, width: "30%" }} />
        <div className="bg-light rounded-pill" style={{ height: 34, width: "35%" }} />
      </div>
    </Card.Body>
  </Card>
);

export const CourseCard: FC<{ course: Curso; rating?: number; students?: number; onDetail?: () => void; onEdit?: () => void }> = ({ course, rating: ratingProp, students = 0, onDetail, onEdit }) => {
  const { userRole, user } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError]  = useState(false);
  const cat      = course.categoria ?? "General";
  const canEdit = userRole === "instructor" && user?._id === course.instructorId;
  const price    = course.precio === 0 ? "Gratis" : `$${course.precio}`;
  const rating   = typeof ratingProp === "number"
    ? ratingProp.toFixed(1)
    : "—";
  const durMins  = course.duracionTotal ?? 0;
  const duration = durMins >= 60 ? `${Math.floor(durMins / 60)}h ${durMins % 60 > 0 ? `${durMins % 60}m` : ""}`.trim() : `${durMins}m`;
  const lecciones = course.totalLecciones ?? course.lecciones?.length ?? 0;
  const showImg  = !!course.imagen && !imgError;

  return (
    <Card
      className="h-100 border-0 rounded-4 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered
          ? "0 12px 32px rgba(59,130,246,0.18)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "all 0.25s ease",
        cursor: "pointer",
      }}
    >
      {/* Thumbnail */}
      <div
        className="d-flex align-items-center justify-content-center overflow-hidden"
        style={{ height: 168, background: categoryColor(cat), position: "relative" }}
      >
        {showImg ? (
          <img
            src={course.imagen}
            alt={course.titulo}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <PlayCircle size={52} strokeWidth={1.2} style={{ color: categoryIconColor(cat), opacity: 0.7 }} />
        )}
        <Badge bg="rgb(255, 255, 255)"
          style={{
            position: "absolute",
            top: 12,
            left: 12,            
            color: categoryIconColor(cat),
            fontWeight: 600,
            fontSize: "0.72rem",
            letterSpacing: "0.02em",
            padding: "5px 10px",
            borderRadius: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          {cat}
        </Badge>
      </div>

      <Card.Body className="p-4 d-flex flex-column">
        <Card.Title className="fw-bold mb-1" style={{ fontSize: "1rem", lineHeight: 1.35, color: "#0f172a" }}>
          {course.titulo}
        </Card.Title>
        <p className="text-muted mb-3" style={{ fontSize: "0.82rem" }}>
          <BookOpen size={12} className="me-1" />
          {course.nivel ?? "Curso"}
        </p>

        <div className="d-flex gap-3 mb-3" style={{ fontSize: "0.78rem", color: "#64748b" }}>
          <span className="d-flex align-items-center gap-1">
            <Star size={12} fill="#facc15" stroke="#facc15" />
            <span style={{ fontWeight: 600, color: "#0f172a" }}>{rating}</span>
          </span>
          <span className="d-flex align-items-center gap-1">
            <Users size={12} />
            {students.toLocaleString()}
          </span>
          <span className="d-flex align-items-center gap-1">
            <Clock size={12} />
            {duration}
          </span>
          {lecciones > 0 && (
            <span className="d-flex align-items-center gap-1">
              <Layers size={12} />
              {lecciones} lec.
            </span>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center mt-auto gap-2">
          <span style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>
            {price}
          </span>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              type="button"
              size="sm"
              className="d-flex align-items-center gap-1 rounded-pill px-3"
              onClick={onDetail}
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                background: hovered ? "#1d4ed8" : "#3b82f6",
                border: "none",
                transition: "background 0.2s",
              }}
            >
              Ver detalle <ArrowRight size={13} />
            </Button>
            {canEdit && onEdit && (
              <Button
                variant="outline-secondary"
                type="button"
                size="sm"
                className="d-flex align-items-center gap-1 rounded-pill px-3"
                onClick={e => { e.stopPropagation(); onEdit(); }}
                style={{ fontSize: "0.82rem", fontWeight: 600, borderColor: "#cbd5e1" }}
              >
                Editar
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
