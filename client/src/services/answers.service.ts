import api from '../lib/api';
import type { ApiResponse, Answer, AnswerForm } from '../types';

export const answersApi = {
  getByQuestion: (questionId: string, page = 1) =>
    api.get<ApiResponse<Answer[]>>(`/answers/question/${questionId}?page=${page}`).then((r) => r.data),

  create: (data: AnswerForm) =>
    api.post<ApiResponse<Answer>>('/answers', data).then((r) => r.data),

  update: (id: string, content: string) =>
    api.patch<ApiResponse<Answer>>(`/answers/${id}`, { content }).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/answers/${id}`).then((r) => r.data),

  accept: (id: string) =>
    api.post(`/answers/${id}/accept`).then((r) => r.data),

  vote: (id: string, value: 1 | -1) =>
    api.post(`/votes/answer/${id}`, { value }).then((r) => r.data),
};
