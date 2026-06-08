import type { AxiosInstance } from 'axios';
import type { AuthUser, LoginDto, LoginResponse } from '../types/auth.types';

export const createAuthService = (httpClient: AxiosInstance) => ({
  login: async (dto: LoginDto): Promise<LoginResponse> => {
    const { data } = await httpClient.post<LoginResponse>('/auth/login', dto);
    return data;
  },

  getMe: async (): Promise<AuthUser> => {
    const { data } = await httpClient.get<AuthUser>('/auth/me');
    return data;
  },
});

export type AuthService = ReturnType<typeof createAuthService>;
