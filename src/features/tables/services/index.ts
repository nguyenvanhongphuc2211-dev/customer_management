import { axiosInstance } from '@/api/axiosInstance';
import { createTableService } from './tableService';

export const tableService = createTableService(axiosInstance);
