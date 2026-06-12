import type { AxiosInstance } from 'axios';
import type { AuthUser, CreateUserDto } from '../types/auth.types';

export const createUserService = (httpClient: AxiosInstance) => ({
  list: async (): Promise<AuthUser[]> => {
    const { data } = await httpClient.get<AuthUser[]>('/users');
    return data;
  },

  create: async (dto: CreateUserDto): Promise<AuthUser> => {
    const { data } = await httpClient.post<AuthUser>('/users', dto);
    return data;
  },
});

export type UserService = ReturnType<typeof createUserService>;
