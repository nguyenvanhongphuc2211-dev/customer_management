import { axiosInstance } from '@/api/axiosInstance';
import { createAuthService } from './authService';

export const authService = createAuthService(axiosInstance);
