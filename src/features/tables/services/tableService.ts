import type { AxiosInstance } from 'axios';
import type {
  CreateTableNoteDto,
  CreateTableOrderDto,
  GetTablesParams,
  OpenTableDto,
  ReserveTableDto,
  TableArea,
  TableDetail,
  TableNote,
  TableOrder,
  TableStatus,
  TableWithMeta,
} from '../types/table.types';

export const createTableService = (httpClient: AxiosInstance) => ({
  getAreas: async (): Promise<TableArea[]> => {
    const { data } = await httpClient.get<TableArea[]>('/table-areas');
    return data;
  },

  getAll: async (params?: GetTablesParams): Promise<TableWithMeta[]> => {
    const { data } = await httpClient.get<TableWithMeta[]>('/tables', { params });
    return data;
  },

  getById: async (id: string): Promise<TableDetail> => {
    const { data } = await httpClient.get<TableDetail>(`/tables/${id}`);
    return data;
  },

  openTable: async (id: string, payload: OpenTableDto): Promise<TableWithMeta> => {
    const { data } = await httpClient.post<TableWithMeta>(`/tables/${id}/open`, payload);
    return data;
  },

  reserveTable: async (id: string, payload: ReserveTableDto): Promise<TableWithMeta> => {
    const { data } = await httpClient.post<TableWithMeta>(`/tables/${id}/reserve`, payload);
    return data;
  },

  closeTable: async (id: string): Promise<TableWithMeta> => {
    const { data } = await httpClient.post<TableWithMeta>(`/tables/${id}/close`);
    return data;
  },

  updateStatus: async (id: string, status: TableStatus): Promise<TableWithMeta> => {
    const { data } = await httpClient.patch<TableWithMeta>(`/tables/${id}/status`, { status });
    return data;
  },

  createNote: async (tableId: string, payload: Omit<CreateTableNoteDto, 'tableId'>) => {
    const { data } = await httpClient.post<TableNote>(`/tables/${tableId}/notes`, payload);
    return data;
  },

  createOrder: async (
    tableId: string,
    payload: CreateTableOrderDto,
  ): Promise<{ order: TableOrder; note: TableNote }> => {
    const { data } = await httpClient.post<{ order: TableOrder; note: TableNote }>(
      `/tables/${tableId}/orders`,
      payload,
    );
    return data;
  },

  cancelOrder: async (orderId: string): Promise<TableOrder> => {
    const { data } = await httpClient.post<TableOrder>(`/table-orders/${orderId}/cancel`);
    return data;
  },

  markNoteDone: async (noteId: string): Promise<TableNote> => {
    const { data } = await httpClient.post<TableNote>(`/table-notes/${noteId}/done`);
    return data;
  },

  deleteNote: async (noteId: string): Promise<void> => {
    await httpClient.delete(`/table-notes/${noteId}`);
  },

  getPendingNotes: async (): Promise<TableNote[]> => {
    const { data } = await httpClient.get<TableNote[]>('/tables/notes/pending');
    return data;
  },
});

export type TableService = ReturnType<typeof createTableService>;
