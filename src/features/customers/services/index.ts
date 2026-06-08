import { axiosInstance } from '@/api/axiosInstance';
import { createCustomerService } from './customerService';

export const customerService = createCustomerService(axiosInstance);
