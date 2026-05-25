import api from "./api";

export interface CategoriaStats {
  categoria: string;
  totalEstudiantes: number;
  totalCursos: number;
}

export interface AnalyticsResumen {
  popularidad_por_categoria: CategoriaStats[];
  total_certificaciones: number;
  total_estudiantes: number;
  promedio_progreso: number;
  total_cursos_publicados: number;
}

export const getAnalyticsResumen = async (): Promise<AnalyticsResumen> => {
  const { data } = await api.get<AnalyticsResumen>("/analytics/resumen");
  return data;
};
