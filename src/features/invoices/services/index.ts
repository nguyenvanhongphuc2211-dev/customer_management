import { axiosInstance } from '@/api/axiosInstance';
import { createInvoiceService } from './invoiceService';

export const invoiceService = createInvoiceService(axiosInstance);
