import React, { useState, useEffect } from "react";
import { Modal, Form, Row, Col, Spinner, Button, Badge } from "react-bootstrap";
import { X } from "lucide-react";
import type { Curso, Leccion } from "../../../types/models";
import { createCurso } from "../../../services/cursosService";
import { getCategorias, getEtiquetas } from "../../../services/Utils";
import { useAuth } from "../../../context/AuthContext";

const CATEGORIAS = ["Desarrollo", "Diseño", "Marketing", "Negocios", "Programación", "Data Science", "DevOps", "Otro"];
const NIVELES = ["Básico", "Intermedio", "Avanzado"] as const;

interface CreateCursoModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (nuevoCurso: Curso) => void;
}

interface CreateForm {
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: "Básico" | "Intermedio" | "Avanzado";
  precio: number;
  publicado: boolean;
  imagen: string;
  etiquetas: string[];
  lecciones: Leccion[];
  newTag: string;
}

const INITIAL_FORM_STATE: CreateForm = {
  titulo: "",
  descripcion: "",
  categoria: CATEGORIAS[0] || "",
  nivel: "Básico",
  precio: 0,
  publicado: false,
  imagen: "",
  etiquetas: [],
  lecciones: [],
  newTag: "",
};

export const CreateCursoModal: React.FC<CreateCursoModalProps> = ({
  show,
  onHide,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [form, setForm] = useState<CreateForm>(INITIAL_FORM_STATE);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getEtiquetas(), getCategorias()])
      .then(([tags, categories]) => {
        setTagSuggestions(tags.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })));
        setCategorySuggestions(categories.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })));
      })
      .catch(() => {
        setTagSuggestions([]);
        setCategorySuggestions([]);
      });
  }, []);

  // Limpiar el estado del formulario al cerrar
  const handleClose = () => {
    setForm(INITIAL_FORM_STATE);
    setSaveError(null);
    onHide();
  };

  const addTag = () => {
    if (form.newTag.trim() && !form.etiquetas.includes(form.newTag.toLowerCase())) {
      setForm(f => ({
        ...f,
        etiquetas: [...f.etiquetas, f.newTag.toLowerCase()],
        newTag: ""
      }));
    }
  };

  const removeTag = (tag: string) => {
    setForm(f => ({
      ...f,
      etiquetas: f.etiquetas.filter(t => t !== tag)
    }));
  };

  const handleCreate = async () => {
    if (!form.titulo.trim()) {
      setSaveError("El título del curso es obligatorio");
      return;
    }
    if (!form.descripcion.trim()) {
      setSaveError("La descripción del curso es obligatoria");
      return;
    }
    if (form.precio < 0) {
      setSaveError("El precio no puede ser negativo");
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const duracionTotal = form.lecciones.reduce((sum, l) => sum + (l.duracion || 0), 0);
      
      // Limpiar las lecciones: remover _id si está vacío
      const leccionesLimpias = form.lecciones.map(l => {
        const leccion: any = {
          titulo: l.titulo,
          videoUrl: l.videoUrl,
          duracion: l.duracion,
          orden: l.orden,
          recursos: l.recursos || []
        };
        // Solo incluir _id si no está vacío
        if (l._id && l._id.trim()) {
          leccion._id = l._id;
        }
        return leccion;
      });
      
      const payload: Partial<Curso> = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        categoria: form.categoria,
        nivel: form.nivel,
        precio: form.precio,
        publicado: form.publicado,
        etiquetas: form.etiquetas,
        lecciones: leccionesLimpias,
        duracionTotal,
        imagen: form.imagen || undefined,
        instructorId: user?._id || "",
      };

      const nuevoCurso = await createCurso(payload);
      onSuccess(nuevoCurso);
      handleClose();
    } catch (error: any) {
      setSaveError(
        error?.response?.data?.message || 
        error?.message || 
        "Hubo un error al crear el curso. Por favor, inténtalo de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton style={{ borderBottom: "1px solid #ede9fe" }}>
        <Modal.Title style={{ fontWeight: 700, color: "#1e1b4b", fontSize: "1.1rem" }}>
          Crear nuevo curso
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Form>
          <Row className="g-3">
            {/* Título */}
            <Col xs={12}>
              <Form.Label className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                Título del curso
              </Form.Label>
              <Form.Control
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                style={{ borderRadius: 10, fontSize: "0.9rem" }}
                placeholder="Ej. Diseño UX/UI con Figma"
              />
            </Col>

            {/* Descripción */}
            <Col xs={12}>
              <Form.Label className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                Descripción
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                style={{ borderRadius: 10, fontSize: "0.9rem", resize: "vertical" }}
                placeholder="Describe los objetivos y de qué trata el curso"
              />
            </Col>

            {/* Imagen URL */}
            <Col xs={12}>
              <Form.Label className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                URL de la imagen
              </Form.Label>
              <Form.Control
                type="url"
                value={form.imagen}
                onChange={e => setForm(f => ({ ...f, imagen: e.target.value }))}
                style={{ borderRadius: 10, fontSize: "0.9rem" }}
                placeholder="https://picsum.photos/seed/curso/640/360"
              />
              {form.imagen && (
                <div className="mt-2" style={{ borderRadius: 10, overflow: "hidden", maxHeight: 150 }}>
                  <img src={form.imagen} alt="preview" style={{ width: "100%", height: "auto", objectFit: "cover" }} onError={() => {}} />
                </div>
              )}
            </Col>

            {/* Categoría y Nivel */}
            <Col xs={12} sm={6}>
              <Form.Label className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                Categoría
              </Form.Label>
              <Form.Control
                value={form.categoria}
                list="category-suggestions"
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                style={{ borderRadius: 10, fontSize: "0.9rem" }}
                placeholder="Ej. Marketing"
              />
              <datalist id="category-suggestions">
                {categorySuggestions.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Label className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                Nivel
              </Form.Label>
              <Form.Select
                value={form.nivel}
                onChange={e => setForm(f => ({ ...f, nivel: e.target.value as CreateForm["nivel"] }))}
                style={{ borderRadius: 10, fontSize: "0.9rem" }}
              >
                {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
              </Form.Select>
            </Col>

            {/* Precio */}
            <Col xs={12} sm={6}>
              <Form.Label className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                Precio (USD)
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                step={0.01}
                value={form.precio}
                onChange={e => setForm(f => ({ ...f, precio: parseFloat(e.target.value) || 0 }))}
                style={{ borderRadius: 10, fontSize: "0.9rem" }}
              />
            </Col>

            {/* Publicado */}
            <Col xs={12} sm={6} className="d-flex align-items-end">
              <Form.Check
                type="switch"
                id="create-publicado-switch"
                label={form.publicado ? "Publicado" : "Borrador"}
                checked={form.publicado}
                onChange={e => setForm(f => ({ ...f, publicado: e.target.checked }))}
                style={{ fontSize: "0.9rem" }}
                className="mb-2"
              />
            </Col>

            {/* Etiquetas */}
            <Col xs={12}>
              <Form.Label className="fw-semibold" style={{ fontSize: "0.85rem", color: "#374151" }}>
                Etiquetas
              </Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Form.Control
                  value={form.newTag}
                  list="tag-suggestions"
                  onChange={e => setForm(f => ({ ...f, newTag: e.target.value }))}
                  onKeyPress={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  style={{ borderRadius: 10, fontSize: "0.9rem" }}
                  placeholder="Ej. diseño, online, principiante"
                />
                <Button
                  variant="outline-secondary"
                  onClick={addTag}
                  style={{ borderRadius: 10, whiteSpace: "nowrap" }}
                >
                  Añadir
                </Button>
              </div>
              <datalist id="tag-suggestions">
                {tagSuggestions.map((tag) => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
              <div className="d-flex flex-wrap gap-2">
                {form.etiquetas.map(tag => (
                  <Badge
                    key={tag}
                    bg="light"
                    text="dark"
                    className="d-flex align-items-center gap-2 px-3 py-2"
                    style={{ fontSize: "0.8rem", borderRadius: 20 }}
                  >
                    {tag}
                    <X
                      size={14}
                      style={{ cursor: "pointer" }}
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </Col>

            {/* Info de lecciones */}
            <Col xs={12}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 12 }}>
                <p style={{ fontSize: "0.85rem", color: "#166534", margin: 0 }}>
                  <strong>Lecciones:</strong> Puedes agregar lecciones detalladas después de crear el curso.
                </p>
              </div>
            </Col>
          </Row>

          {saveError && (
            <div className="alert alert-danger rounded-3 mt-3 mb-0" style={{ fontSize: "0.85rem" }}>
              {saveError}
            </div>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer style={{ borderTop: "1px solid #ede9fe" }}>
        <button
          className="btn rounded-pill px-4"
          style={{ border: "1.5px solid #e5e7eb", color: "#6b7280", fontSize: "0.875rem" }}
          onClick={handleClose}
          disabled={saving}
          type="button"
        >
          Cancelar
        </button>
        <button
          className="btn rounded-pill px-4 fw-semibold text-white"
          style={{ background: "linear-gradient(90deg,#7c3aed,#8b5cf6)", border: "none", fontSize: "0.875rem", minWidth: 100 }}
          onClick={handleCreate}
          disabled={saving}
          type="button"
        >
          {saving ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Creando…
            </>
          ) : (
            "Crear curso"
          )}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateCursoModal;