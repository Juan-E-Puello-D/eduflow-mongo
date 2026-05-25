export interface Leccion {
  _id: string;
  titulo: string;
  videoUrl: string;
  duracion: number;
  orden: number;
  recursos: string[];
}

export interface Curso {
  _id: string;
  titulo: string;
  descripcion: string;
  instructorId: string;
  categoria: string;
  precio: number;
  etiquetas: string[];
  duracionTotal: number;
  fechaCreacion: string;
  lecciones: Leccion[];
  nivel: "Básico" | "Intermedio" | "Avanzado";
  publicado: boolean;
  imagen?: string;
  totalLecciones?: number;
}

export interface Preferencias {
  idioma: "es" | "en";
  modoOscuro: boolean;
}

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: "instructor" | "estudiante";
  avatarUrl: string;
  fechaRegistro: string;
  bio?: string;
  preferencias?: Preferencias;
  cursosCreados?: string[];
}

export interface Inscripcion {
  _id: string;
  usuarioId: string;
  cursoId: string;
  leccionesCompletadas: string[];
  porcentajeProgreso: number;
  fechaInscripcion: string;
  ultimaActividad: string;
}

export interface Respuesta {
  usuarioId: string;
  contenido: string;
  fecha: string;
}

export interface Comentario {
  _id: string;
  cursoId: string;
  usuarioId: string;
  leccionId: string;
  contenido: string;
  calificacion: number | null;
  fecha: string;
  respuestas: Respuesta[];
}
