import api from "./api";

export const getCategorias = async (): Promise<string[]> => {
  const { data } = await api.get<string[]>("/utils/categorias");
  return data;
};

export const getEtiquetas = async (): Promise<string[]> => {
  const { data } = await api.get<string[]>("/utils/etiquetas");
  return data;
};