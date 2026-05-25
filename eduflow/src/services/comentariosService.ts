import api from "./api";
import type { Comentario } from "../types/models";

export const getComentarios = async (filters: { cursoId?: string; leccionId?: string } = {}): Promise<Comentario[]> => {
  const { data } = await api.get<Comentario[]>("/comentarios", { params: filters });
  return data;
};

export const createComentario = async (payload: {
  cursoId: string;
  usuarioId: string;
  leccionId: string;
  contenido: string;
  calificacion?: number;
}): Promise<Comentario> => {
  const { data } = await api.post<Comentario>("/comentarios", payload);
  return data;
};

export const responderComentario = async (
  comentarioId: string,
  usuarioId: string,
  contenido: string
): Promise<Comentario> => {
  const { data } = await api.post<Comentario>(`/comentarios/${comentarioId}/respuestas`, {
    usuarioId,
    contenido,
  });
  return data;
};
