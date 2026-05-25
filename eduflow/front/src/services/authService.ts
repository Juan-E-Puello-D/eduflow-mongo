import api from "./api";
import type { Usuario } from "../types/models";

interface AuthResponse {
  user: Usuario;
  token: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
};

export const register = async (
  nombre: string,
  email: string,
  password: string,
  rol: "estudiante" | "instructor" = "estudiante"
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/register", { nombre, email, password, rol });
  return data;
};
