import api from '../lib/api';
import type { ApiResponse, SearchResult, TrendingSearch } from '../types';

export const searchApi = {
  search: (q: string, page = 1, category?: string) => {
    const params = new URLSearchParams({ q, page: String(page) });
    if (category) params.set('category', category);
    return api.get<ApiResponse<SearchResult[]>>(`/search?${params}`).then((r) => r.data);
  },

  getTrending: () =>
    api.get<ApiResponse<TrendingSearch[]>>('/search/trending').then((r) => r.data),

  getRecent: () =>
    api.get<ApiResponse<{ query: string; createdAt: string }[]>>('/search/recent').then((r) => r.data),

  reportUnanswered: (query: string) =>
    api.post('/search/report-unanswered', { query }).then((r) => r.data),
};
