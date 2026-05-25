import api from "./api";
import type { Inscripcion } from "../types/models";

export const getInscripciones = async (filters: { usuarioId?: string; cursoId?: string } = {}): Promise<Inscripcion[]> => {
  const { data } = await api.get<Inscripcion[]>("/inscripciones", { params: filters });
  return data;
};

export const inscribirse = async (usuarioId: string, cursoId: string): Promise<Inscripcion> => {
  const { data } = await api.post<Inscripcion>("/inscripciones", { usuarioId, cursoId });
  return data;
};

export const marcarProgreso = async (
  inscripcionId: string,
  leccionId: string,
  totalLecciones: number
): Promise<Inscripcion> => {
  const { data } = await api.patch<Inscripcion>(`/inscripciones/${inscripcionId}/progreso`, {
    leccionId,
    totalLecciones,
  });
  return data;
};
