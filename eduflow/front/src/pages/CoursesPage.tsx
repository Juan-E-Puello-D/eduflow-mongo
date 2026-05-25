import { useEffect, useState, useMemo, useRef, type FC } from "react";
import {
  Container, Row, Col, Form, InputGroup, Button, Pagination,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { Search, SlidersHorizontal, BookOpen, X, Star, DollarSign } from "lucide-react";
import { getCursos } from "../services/cursosService";
import { getComentarios } from "../services/comentariosService";
import { getStudentCounts } from "../services/inscripcionesService";
import { getCategorias } from "../services/Utils";
import { CourseCard, SkeletonCard, type CourseWithRating } from "../components/CourseCardShared";

const PAGE_SIZE = 9;

const inputStyle: React.CSSProperties = {
  fontSize: "0.88rem",
  border: "1.5px solid #e2e8f0",
  background: "#f8fafc",
  boxShadow: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  color: "#475569",
  fontWeight: 600,
  marginBottom: 4,
  display: "block",
};

// Star rating display for the slider label
const StarLabel: FC<{ value: number }> = ({ value }) => (
  <span className="d-flex align-items-center gap-1" style={{ fontSize: "0.88rem" }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={14}
        fill={s <= value ? "#facc15" : "none"}
        stroke={s <= value ? "#facc15" : "#cbd5e1"}
        strokeWidth={1.5}
      />
    ))}
    <span style={{ color: "#64748b", marginLeft: 2 }}>
      {value === 0 ? "Todas" : `${value}+ estrellas`}
    </span>
  </span>
);

const CoursesPage: FC = () => {
  const [allCourses, setAllCourses]           = useState<CourseWithRating[]>([]);
  const [loading, setLoading]                 = useState(true);
  const { setActiveTab, setSelectedCourseId }  = useAuth();
  const [search, setSearch]                   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoria, setCategoria]             = useState("");
  const [categories, setCategories]           = useState<string[]>([]);
  const [minRating, setMinRating]             = useState(0);
  const [precioMin, setPrecioMin]             = useState("");
  const [precioMax, setPrecioMax]             = useState("");
  const [page, setPage]                       = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([getCursos(), getComentarios(), getStudentCounts(), getCategorias()])
      .then(([cursos, comentarios, studentCounts, categorias]) => {
        const ratingMap = new Map<string, { sum: number; count: number }>();
        comentarios.forEach((c) => {
          if (c.cursoId && typeof c.calificacion === "number") {
            const cur = ratingMap.get(c.cursoId) ?? { sum: 0, count: 0 };
            cur.sum += c.calificacion;
            cur.count += 1;
            ratingMap.set(c.cursoId, cur);
          }
        });
        setAllCourses(
          cursos.map((curso) => ({
            ...curso,
            rating: ratingMap.has(curso._id)
              ? ratingMap.get(curso._id)!.sum / ratingMap.get(curso._id)!.count
              : 0,
            students: studentCounts[curso._id] ?? 0,
          }))
        );
        setCategories(categorias.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })));
      })
      .catch((e: unknown) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 350);
  };

  const handleCategoria = (v: string) => { setCategoria(v); setPage(1); };
  const handleMinRating = (v: number) => { setMinRating(v); setPage(1); };
  const handlePrecioMin = (v: string) => { setPrecioMin(v); setPage(1); };
  const handlePrecioMax = (v: string) => { setPrecioMax(v); setPage(1); };

  const maxPrecioData = useMemo(
    () => Math.ceil(Math.max(0, ...allCourses.map((c) => c.precio))),
    [allCourses]
  );

  const hasFilters =
    !!debouncedSearch || !!categoria || minRating > 0 || !!precioMin || !!precioMax;

  const clearFilters = () => {
    setSearch(""); setDebouncedSearch("");
    setCategoria("");
    setMinRating(0);
    setPrecioMin(""); setPrecioMax("");
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q    = debouncedSearch.toLowerCase();
    const pMin = precioMin !== "" ? Number(precioMin) : null;
    const pMax = precioMax !== "" ? Number(precioMax) : null;
    return allCourses.filter((c) => {
      if (q && !c.titulo.toLowerCase().includes(q) && !(c.descripcion ?? "").toLowerCase().includes(q))
        return false;
      if (categoria && c.categoria !== categoria) return false;
      if (minRating > 0 && c.rating < minRating) return false;
      if (pMin !== null && c.precio < pMin) return false;
      if (pMax !== null && c.precio > pMax) return false;
      return true;
    });
  }, [allCourses, debouncedSearch, categoria, minRating, precioMin, precioMax]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const renderPagination = () => {
    const items = [];
    const WINDOW = 2;
    const start = Math.max(1, page - WINDOW);
    const end   = Math.min(totalPages, page + WINDOW);

    items.push(
      <Pagination.Prev key="prev" disabled={page === 1} onClick={() => setPage(p => p - 1)} />
    );
    if (start > 1) {
      items.push(<Pagination.Item key={1} onClick={() => setPage(1)}>1</Pagination.Item>);
      if (start > 2) items.push(<Pagination.Ellipsis key="e1" disabled />);
    }
    for (let i = start; i <= end; i++) {
      items.push(
        <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>{i}</Pagination.Item>
      );
    }
    if (end < totalPages) {
      if (end < totalPages - 1) items.push(<Pagination.Ellipsis key="e2" disabled />);
      items.push(
        <Pagination.Item key={totalPages} onClick={() => setPage(totalPages)}>{totalPages}</Pagination.Item>
      );
    }
    items.push(
      <Pagination.Next key="next" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
    );
    return items;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1f6e 0%, #1565c0 60%, #1e88e5 100%)",
          padding: "48px 0 40px",
        }}
      >
        <Container>
          <h1 className="fw-bold text-white mb-1" style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)" }}>
            Todos los cursos
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 0, fontSize: "1rem" }}>
            {loading ? "Cargando..." : `${allCourses.length} cursos disponibles`}
          </p>
        </Container>
      </div>

      <Container className="py-5">
        {/* Panel de filtros */}
        <div
          className="rounded-4 mb-4 p-3 p-md-4"
          style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
        >
          {/* Fila 1: Búsqueda + Categoría + Clear */}
          <Row className="g-3 align-items-end mb-3">
            <Col xs={12} md={5}>
              <span style={labelStyle}>Buscar</span>
              <InputGroup>
                <InputGroup.Text
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRight: "none",
                  }}
                >
                  <Search size={15} color="#94a3b8" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Título o descripción…"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{ ...inputStyle, borderLeft: "none" }}
                />
              </InputGroup>
            </Col>

            <Col xs={12} md={4}>
              <span style={labelStyle}>Categoría</span>
              <Form.Select
                value={categoria}
                onChange={(e) => handleCategoria(e.target.value)}
                style={inputStyle}
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} md={3} className="d-flex align-items-end">
              {hasFilters ? (
                <Button
                  variant="outline-secondary"
                  className="w-100 d-flex align-items-center justify-content-center gap-2 rounded-3"
                  style={{ fontSize: "0.85rem", borderColor: "#e2e8f0", padding: "8px 0" }}
                  onClick={clearFilters}
                >
                  <X size={14} /> Limpiar filtros
                </Button>
              ) : (
                <div
                  className="w-100 d-flex align-items-center justify-content-center gap-2 rounded-3"
                  style={{
                    fontSize: "0.82rem",
                    color: "#94a3b8",
                    border: "1.5px dashed #e2e8f0",
                    padding: "8px 0",
                  }}
                >
                  <SlidersHorizontal size={13} /> Sin filtros activos
                </div>
              )}
            </Col>
          </Row>

          {/* Divisor */}
          <hr style={{ borderColor: "#f1f5f9", margin: "0 0 16px" }} />

          {/* Fila 2: Rating slider + Precio min/max */}
          <Row className="g-3 align-items-end">
            {/* Calificación mínima */}
            <Col xs={12} md={5}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={labelStyle} className="mb-0">Calificación mínima</span>
                <StarLabel value={minRating} />
              </div>
              <div style={{ padding: "0 4px" }}>
                <Form.Range
                  min={0}
                  max={5}
                  step={1}
                  value={minRating}
                  onChange={(e) => handleMinRating(Number(e.target.value))}
                  style={{ accentColor: "#3b82f6" }}
                />
                <div
                  className="d-flex justify-content-between"
                  style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}
                >
                  <span>Todas</span>
                  <span>★ 1</span>
                  <span>★ 2</span>
                  <span>★ 3</span>
                  <span>★ 4</span>
                  <span>★ 5</span>
                </div>
              </div>
            </Col>

            {/* Precio mínimo */}
            <Col xs={6} md={3}>
              <span style={labelStyle}>Precio mínimo</span>
              <InputGroup>
                <InputGroup.Text
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRight: "none",
                    fontSize: "0.85rem",
                    color: "#64748b",
                  }}
                >
                  <DollarSign size={13} />
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  min={0}
                  placeholder="0"
                  value={precioMin}
                  onChange={(e) => handlePrecioMin(e.target.value)}
                  style={{ ...inputStyle, borderLeft: "none" }}
                />
              </InputGroup>
            </Col>

            {/* Precio máximo */}
            <Col xs={6} md={3}>
              <span style={labelStyle}>Precio máximo</span>
              <InputGroup>
                <InputGroup.Text
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRight: "none",
                    fontSize: "0.85rem",
                    color: "#64748b",
                  }}
                >
                  <DollarSign size={13} />
                </InputGroup.Text>
                <Form.Control
                  type="number"
                  min={0}
                  placeholder={maxPrecioData > 0 ? String(maxPrecioData) : "∞"}
                  value={precioMax}
                  onChange={(e) => handlePrecioMax(e.target.value)}
                  style={{ ...inputStyle, borderLeft: "none" }}
                />
              </InputGroup>
            </Col>

            <Col xs={12} md={1} className="d-flex align-items-end pb-1">
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.3 }}>
                {loading ? "" : `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}`}
              </span>
            </Col>
          </Row>
        </div>

        {/* Grid de cursos */}
        {loading ? (
          <Row className="g-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Col key={i} xs={12} sm={6} lg={4}>
                <SkeletonCard />
              </Col>
            ))}
          </Row>
        ) : paginated.length === 0 ? (
          <div
            className="text-center py-5 rounded-4"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
          >
            <BookOpen size={52} strokeWidth={1} className="mb-3 opacity-25" style={{ color: "#94a3b8" }} />
            <p className="fw-semibold mb-1" style={{ color: "#0f172a" }}>Sin resultados</p>
            <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
              No encontramos cursos que coincidan con los filtros seleccionados.
            </p>
            <Button variant="outline-primary" className="rounded-pill px-4" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <Row className="g-4">
            {paginated.map((c) => (
              <Col key={c._id} xs={12} sm={6} lg={4}>
                <CourseCard
                  course={c}
                  rating={c.rating}
                  students={c.students}
                  onDetail={() => {
                    setSelectedCourseId(c._id);
                    setActiveTab("courseDetail");
                  }}
                />
              </Col>
            ))}
          </Row>
        )}

        {/* Paginación */}
        {!loading && totalPages > 1 && (
          <div className="d-flex flex-column align-items-center gap-2 mt-5">
            <Pagination className="mb-0">{renderPagination()}</Pagination>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
              Página {page} de {totalPages} · {filtered.length} cursos
            </span>
          </div>
        )}
      </Container>
    </div>
  );
};

export default CoursesPage;
