import React, { useState, useEffect } from "react";
import { Modal, Form, Row, Col, Spinner, Button, Badge, Card } from "react-bootstrap";
import { X, Plus, Trash2 } from "lucide-react";
import type { Curso, Leccion } from "../../../types/models";
import { updateCurso } from "../../../services/cursosService";
import { getCategorias, getEtiquetas } from "../../../services/Utils";

const CATEGORIAS = ["Desarrollo", "Diseño", "Marketing", "Negocios", "Programación", "Data Science", "DevOps", "Otro"];
const NIVELES = ["Básico", "Intermedio", "Avanzado"] as const;

interface EditCursoModalProps {
  show: boolean;
  onHide: () => void;
  curso: Curso | null;
  onSuccess: (cursoActualizado: Curso) => void;
}

interface EditForm {
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
  editingLesson: Leccion | null;
  showLessonForm: boolean;
}

const EditCursoModal: React.FC<EditCursoModalProps> = ({
  show,
  onHide,
  curso,
  onSuccess,
}) => {
  const [form, setForm] = useState<EditForm>({
    titulo: "",
    descripcion: "",
    categoria: "",
    nivel: "Básico",
    precio: 0,
    publicado: false,
    imagen: "",
    etiquetas: [],
    lecciones: [],
    newTag: "",
    editingLesson: null,
    showLessonForm: false,
  });
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getEtiquetas(), getCategorias()])
      .then(([tags, categories]) => {
        setTagSuggestions(tags.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })));
        setCategorySuggestions(
          [...new Set([...categories, ...CATEGORIAS])].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
        );
      })
      .catch(() => {
        setTagSuggestions([]);
        setCategorySuggestions(CATEGORIAS.slice().sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })));
      });
  }, []);

  useEffect(() => {
    if (curso && show) {
      setForm({
        titulo: curso.titulo,
        descripcion: curso.descripcion,
        categoria: curso.categoria ?? "",
        nivel: curso.nivel ?? "Básico",
        precio: curso.precio ?? 0,
        publicado: curso.publicado,
        imagen: curso.imagen ?? "",
        etiquetas: [...(curso.etiquetas ?? [])],
        lecciones: [...(curso.lecciones ?? [])],
        newTag: "",
        editingLesson: null,
        showLessonForm: false,
      });
      setSaveError(null);
    }
  }, [curso, show]);

  const handleClose = () => {
    setForm({
      titulo: "",
      descripcion: "",
      categoria: "",
      nivel: "Básico",
      precio: 0,
      publicado: false,
      imagen: "",
      etiquetas: [],
      lecciones: [],
      newTag: "",
      editingLesson: null,
      showLessonForm: false,
    });
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

  const startEditLesson = (leccion: Leccion) => {
    setForm(f => ({
      ...f,
      editingLesson: { ...leccion },
      showLessonForm: true
    }));
  };

  const generateTempLessonId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  };

  const saveLesson = () => {
    if (!form.editingLesson) return;
    
    if (!form.editingLesson.titulo.trim()) {
      setSaveError("El título de la lección es obligatorio");
      return;
    }

    if (form.editingLesson._id) {
      // Editando una lección existente
      setForm(f => ({
        ...f,
        lecciones: f.lecciones.map(l => l._id === f.editingLesson!._id ? f.editingLesson! : l),
        editingLesson: null,
        showLessonForm: false
      }));
    } else {
      // Agregando nueva lección con ID temporal para poder editarla/eliminarla en UI
      const newLeccion: Leccion = {
        _id: generateTempLessonId(),
        titulo: form.editingLesson.titulo,
        videoUrl: form.editingLesson.videoUrl,
        duracion: form.editingLesson.duracion,
        orden: Math.max(0, ...form.lecciones.map(l => l.orden || 0)) + 1,
        recursos: form.editingLesson.recursos || []
      };
      setForm(f => ({
        ...f,
        lecciones: [...f.lecciones, newLeccion],
        editingLesson: null,
        showLessonForm: false
      }));
    }
    setSaveError(null);
  };

  const deleteLesson = (leccionId: string) => {
    setForm(f => ({
      ...f,
      lecciones: f.lecciones.filter(l => l._id !== leccionId)
    }));
  };

  const cancelEditLesson = () => {
    setForm(f => ({
      ...f,
      editingLesson: null,
      showLessonForm: false
    }));
    setSaveError(null);
  };

  const addNewLesson = () => {
    setForm(f => ({
      ...f,
      editingLesson: {
        _id: "",
        titulo: "",
        videoUrl: "",
        duracion: 0,
        orden: Math.max(0, ...f.lecciones.map(l => l.orden || 0)) + 1,
        recursos: []
      },
      showLessonForm: true
    }));
  };

  const handleSave = async () => {
    if (!curso) return;

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
        // Solo incluir _id si no está vacío (para lecciones existentes)
        if (l._id && l._id.trim()) {
          leccion._id = l._id;
        }
        return leccion;
      });
      
      const updated = await updateCurso(curso._id, {
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
      });

      onSuccess(updated);
      handleClose();
    } catch (error: any) {
      setSaveError(
        error?.response?.data?.message || 
        error?.message || 
        "Hubo un error al guardar el curso. Por favor, inténtalo de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  const duracionTotal = form.lecciones.reduce((sum, l) => sum + (l.duracion || 0), 0);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" scrollable>
      <Modal.Header closeButton style={{ borderBottom: "1px solid #ede9fe" }}>
        <Modal.Title style={{ fontWeight: 700, color: "#1e1b4b", fontSize: "1.1rem" }}>
          Editar curso: {form.titulo}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
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
                onChange={e => setForm(f => ({ ...f, nivel: e.target.value as EditForm["nivel"] }))}
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
                id="edit-publicado-switch"
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

            {/* Lecciones */}
            <Col xs={12}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold mb-0" style={{ color: "#374151" }}>
                  Lecciones ({form.lecciones.length} • {duracionTotal} min)
                </h6>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={addNewLesson}
                  style={{ borderRadius: 8 }}
                >
                  <Plus size={14} className="me-1" /> Nueva lección
                </Button>
              </div>

              {form.lecciones.length === 0 ? (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 12 }}>
                  <p style={{ fontSize: "0.85rem", color: "#166534", margin: 0 }}>
                    Aún no hay lecciones. Crea tu primera lección ahora.
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {form.lecciones.map((leccion, idx) => (
                    <Card key={leccion._id} className="border rounded-3" style={{ background: "#f9fafb" }}>
                      <Card.Body className="p-3 d-flex justify-content-between align-items-start">
                        <div style={{ flex: 1 }}>
                          <div className="fw-semibold" style={{ fontSize: "0.9rem", color: "#1f2937" }}>
                            {idx + 1}. {leccion.titulo}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 4 }}>
                            Duración: {leccion.duracion} min • Recursos: {leccion.recursos?.length ?? 0}
                          </div>
                          {leccion.videoUrl && (
                            <div style={{ fontSize: "0.8rem", color: "#7c3aed", marginTop: 4, wordBreak: "break-all" }}>
                              {leccion.videoUrl.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => startEditLesson(leccion)}
                            style={{ borderRadius: 6 }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => deleteLesson(leccion._id)}
                            style={{ borderRadius: 6, color: "#dc2626" }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Col>

            {/* Formulario de edición de lección */}
            {form.showLessonForm && form.editingLesson && (
              <Col xs={12}>
                <Card className="border rounded-3" style={{ background: "#faf5ff", borderColor: "#e9d5ff" }}>
                  <Card.Body className="p-3">
                    <h6 className="fw-semibold mb-3" style={{ color: "#6d28d9" }}>
                      {form.editingLesson._id ? "Editar lección" : "Nueva lección"}
                    </h6>
                    
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontSize: "0.85rem", color: "#374151" }}>
                        Título de la lección
                      </Form.Label>
                      <Form.Control
                        value={form.editingLesson.titulo}
                        onChange={e => setForm(f => ({
                          ...f,
                          editingLesson: f.editingLesson ? { ...f.editingLesson, titulo: e.target.value } : null
                        }))}
                        style={{ borderRadius: 8, fontSize: "0.9rem" }}
                        placeholder="Ej. Principios de UX"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontSize: "0.85rem", color: "#374151" }}>
                        URL del video
                      </Form.Label>
                      <Form.Control
                        type="url"
                        value={form.editingLesson.videoUrl}
                        onChange={e => setForm(f => ({
                          ...f,
                          editingLesson: f.editingLesson ? { ...f.editingLesson, videoUrl: e.target.value } : null
                        }))}
                        style={{ borderRadius: 8, fontSize: "0.9rem" }}
                        placeholder="https://storage.eduflow.com/..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontSize: "0.85rem", color: "#374151" }}>
                        Duración (minutos)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min={0}
                        value={form.editingLesson.duracion}
                        onChange={e => setForm(f => ({
                          ...f,
                          editingLesson: f.editingLesson ? { ...f.editingLesson, duracion: parseInt(e.target.value) || 0 } : null
                        }))}
                        style={{ borderRadius: 8, fontSize: "0.9rem" }}
                      />
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={saveLesson}
                        style={{ borderRadius: 8, background: "#7c3aed", border: "none" }}
                      >
                        Guardar lección
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={cancelEditLesson}
                        style={{ borderRadius: 8 }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )}
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
          onClick={handleSave}
          disabled={saving}
          type="button"
        >
          {saving ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Guardando…
            </>
          ) : (
            "Guardar cambios"
          )}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditCursoModal;