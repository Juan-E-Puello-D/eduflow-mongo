import api from "./api";
import type { Curso } from "../types/models";

interface CursosFilter {
  categoria?: string;
  nivel?: string;
  instructorId?: string;
  q?: string;
}

export const getCursos = async (filters: CursosFilter = {}): Promise<Curso[]> => {
  const { data } = await api.get<Curso[]>("/cursos", { params: filters });
  return data;
};

export const getCursoById = async (id: string): Promise<Curso> => {
  const { data } = await api.get<Curso>(`/cursos/${id}`);
  return data;
};

export const createCurso = async (payload: Partial<Curso>): Promise<Curso> => {
  const { data } = await api.post<Curso>("/cursos", payload);
  return data;
};

export const updateCurso = async (id: string, payload: Partial<Curso>): Promise<Curso> => {
  const { data } = await api.put<Curso>(`/cursos/${id}`, payload);
  return data;
};

export const deleteCurso = async (id: string): Promise<void> => {
  await api.delete(`/cursos/${id}`);
};
