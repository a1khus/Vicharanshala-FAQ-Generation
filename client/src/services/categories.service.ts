import api from '../lib/api';
import type { ApiResponse, Category } from '../types';

export const categoriesApi = {
  getAll: () =>
    api.get<ApiResponse<Category[]>>('/categories').then((r) => r.data),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<Category>>(`/categories/${slug}`).then((r) => r.data),

  create: (data: Partial<Category>) =>
    api.post<ApiResponse<Category>>('/categories', data).then((r) => r.data),

  update: (id: string, data: Partial<Category>) =>
    api.patch<ApiResponse<Category>>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`).then((r) => r.data),
};
