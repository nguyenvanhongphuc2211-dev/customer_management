import { axiosInstance } from '@/api/axiosInstance';
import { createMenuService } from './menuService';

export const menuService = createMenuService(axiosInstance);
