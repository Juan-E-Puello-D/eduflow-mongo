import api from "./api";

export interface Course {
  id?: number;
  title?: string;
  instructor?: string;
  category?: string;
  cat?: string;
  price?: string;
}

export const getCourses = async (): Promise<Course[]> => {
  const response = await api.get<Course[]>("/courses");
  return response.data;
};

export const getCourseById = async (id: number): Promise<Course> => {
  const response = await api.get<Course>(`/courses/${id}`);
  return response.data;
};
