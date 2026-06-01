import api from '../lib/api';
import type { ApiResponse, Question, QuestionFilters, QuestionForm } from '../types';

export const questionsApi = {
  getAll: (filters: QuestionFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.tags?.length) params.set('tags', filters.tags.join(','));
    return api.get<ApiResponse<Question[]>>(`/questions?${params}`).then((r) => r.data);
  },

  getById: (id: string) =>
    api.get<ApiResponse<Question>>(`/questions/${id}`).then((r) => r.data),

  create: (data: QuestionForm) =>
    api.post<ApiResponse<Question>>('/questions', data).then((r) => r.data),

  update: (id: string, data: Partial<QuestionForm>) =>
    api.patch<ApiResponse<Question>>(`/questions/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/questions/${id}`).then((r) => r.data),

  incrementView: (id: string) =>
    api.post(`/questions/${id}/view`).then((r) => r.data),

  getTrending: () =>
    api.get<ApiResponse<Question[]>>('/questions/trending').then((r) => r.data),

  getPopular: () =>
    api.get<ApiResponse<Question[]>>('/questions/popular').then((r) => r.data),

  getRelated: (id: string) =>
    api.get<ApiResponse<Question[]>>(`/questions/${id}/related`).then((r) => r.data),

  getMostSearched: () =>
    api.get<ApiResponse<Question[]>>('/questions/most-searched').then((r) => r.data),

  recordSearchClick: (id: string) =>
    api.post(`/questions/${id}/search-click`).then((r) => r.data),

  vote: (id: string, value: 1 | -1) =>
    api.post(`/votes/question/${id}`, { value }).then((r) => r.data),

  getUserVote: (id: string) =>
    api.get(`/votes/question/${id}`).then((r) => r.data),
};
