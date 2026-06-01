import api from '../lib/api';
import type { ApiResponse, SiteStats, User, Question, UnansweredSearch } from '../types';

export const adminApi = {
  getStats: () =>
    api.get<ApiResponse<SiteStats>>('/admin/stats').then((r) => r.data),

  getTopContributors: () =>
    api.get<ApiResponse<User[]>>('/admin/contributors').then((r) => r.data),

  getUsers: (page = 1, search?: string) => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set('search', search);
    return api.get<ApiResponse<User[]>>(`/admin/users?${params}`).then((r) => r.data);
  },

  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),

  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`).then((r) => r.data),

  getQuestions: (page = 1, status?: string) => {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set('status', status);
    return api.get<ApiResponse<Question[]>>(`/admin/questions?${params}`).then((r) => r.data);
  },

  deleteQuestion: (id: string) =>
    api.delete(`/admin/questions/${id}`).then((r) => r.data),

  getUnansweredSearches: (page = 1) =>
    api.get<ApiResponse<UnansweredSearch[]>>(`/admin/unanswered-searches?page=${page}`).then((r) => r.data),

  getSearchAnalytics: (days = 7) =>
    api.get(`/admin/search-analytics?days=${days}`).then((r) => r.data),
};
