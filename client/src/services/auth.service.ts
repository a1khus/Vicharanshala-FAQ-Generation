import api from '../lib/api';
import type { ApiResponse, AuthResponse, LoginForm, SignupForm } from '../types';

export const authApi = {
  signup: (data: SignupForm) =>
    api.post<ApiResponse<AuthResponse>>('/auth/signup', data).then((r) => r.data),

  login: (data: LoginForm) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  refresh: () =>
    api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh').then((r) => r.data),

  getMe: () =>
    api.get<ApiResponse<AuthResponse['user']>>('/auth/me').then((r) => r.data),
};
