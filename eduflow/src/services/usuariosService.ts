import api from "./api";
import type { Usuario } from "../types/models";

export const getUsuario = async (id: string): Promise<Usuario> => {
  const { data } = await api.get<Usuario>(`/usuarios/${id}`);
  return data;
};

export const updateUsuario = async (id: string, payload: Partial<Usuario>): Promise<Usuario> => {
  const { data } = await api.put<Usuario>(`/usuarios/${id}`, payload);
  return data;
};
