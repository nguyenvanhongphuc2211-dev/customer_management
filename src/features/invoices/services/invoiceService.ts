import type { AxiosInstance } from 'axios';
import type { CreateInvoiceDto, InvoiceLineItem, TableInvoice } from '../types/invoice.types';

export const createInvoiceService = (httpClient: AxiosInstance) => ({
  list: async (): Promise<TableInvoice[]> => {
    const { data } = await httpClient.get<TableInvoice[]>('/invoices');
    return data;
  },

  getDraftItems: async (tableId: string): Promise<InvoiceLineItem[]> => {
    const { data } = await httpClient.get<{ items: InvoiceLineItem[] }>(`/invoices/draft/${tableId}`);
    return data.items;
  },

  create: async (dto: CreateInvoiceDto): Promise<TableInvoice> => {
    const { data } = await httpClient.post<TableInvoice>('/invoices', dto);
    return data;
  },

  exportFile: async (id: string, invoiceNumber: string): Promise<void> => {
    const response = await httpClient.get(`/invoices/${id}/export`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${invoiceNumber}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
});

export type InvoiceService = ReturnType<typeof createInvoiceService>;
