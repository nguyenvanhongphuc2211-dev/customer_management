import { axiosInstance } from '@/api/axiosInstance';
import { createAuthService } from './authService';
import { createUserService } from './userService';

export const authService = createAuthService(axiosInstance);
export const userService = createUserService(axiosInstance);
