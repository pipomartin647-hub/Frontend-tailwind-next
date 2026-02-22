import { api } from './api';
import type { AuthTokenResponse } from '@/types/api.types';

export const authService = {
  async login(email: string, password: string): Promise<AuthTokenResponse> {
    return api.post<AuthTokenResponse>('/auth/login', { email, password });
  },

  async register(name: string, email: string, password: string): Promise<AuthTokenResponse> {
    return api.post<AuthTokenResponse>('/auth/register', { name, email, password });
  },

  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
    // Cookie HttpOnly no puede setearse desde JS — esta cookie la usa el middleware Next.js
    document.cookie = `access_token=${token}; path=/; SameSite=Lax`;
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  removeToken(): void {
    localStorage.removeItem('access_token');
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },
};