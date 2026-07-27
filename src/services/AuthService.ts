import { apiService } from './api';
import { tokenStorage } from './tokenStorage';
import { AuthResponse, User } from '../models';

class AuthService {
  async signup(email: string, password: string): Promise<AuthResponse> {
    const res = await apiService.post<AuthResponse>('/api/auth/signup', { email, password }, { skipAuth: true });
    await tokenStorage.setTokens(res.accessToken, res.refreshToken);
    return res;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiService.post<AuthResponse>('/api/auth/login', { email, password }, { skipAuth: true });
    await tokenStorage.setTokens(res.accessToken, res.refreshToken);
    return res;
  }

  async me(): Promise<User> {
    return apiService.get<User>('/api/auth/me');
  }

  async logout(): Promise<void> {
    const refreshToken = await tokenStorage.getRefreshToken();
    try {
      await apiService.post('/api/auth/logout', { refreshToken });
    } finally {
      await tokenStorage.clear();
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.patch('/api/auth/password', { currentPassword, newPassword });
    // Backend revokes ALL refresh tokens (including this session's) on password change.
    await tokenStorage.clear();
  }

  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/api/auth/forgot-password', { email }, { skipAuth: true });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/api/auth/reset-password', { token, newPassword }, { skipAuth: true });
  }
}

export const authService = new AuthService();
