import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { tableService } from '../services';
import type { CreateTableOrderDto, OpenTableDto, ReserveTableDto, TableNoteType, TableStatus } from '../types/table.types';
import { TABLES_QUERY_KEY } from './useTables';

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: [TABLES_QUERY_KEY] });
  queryClient.invalidateQueries({ queryKey: ['table'] });
  queryClient.invalidateQueries({ queryKey: ['table-notes-pending'] });
};

export const useOpenTable = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: OpenTableDto }) =>
      tableService.openTable(id, payload),
    onSuccess: () => {
      invalidate(queryClient);
      showToast('Đã mở bàn', 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err.response?.data?.message ?? 'Không thể mở bàn', 'error');
    },
  });
};

export const useCloseTable = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => tableService.closeTable(id),
    onSuccess: () => {
      invalidate(queryClient);
      showToast('Đã đóng bàn — chuyển dọn bàn', 'success');
    },
    onError: () => showToast('Không thể đóng bàn', 'error'),
  });
};

export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      tableService.updateStatus(id, status),
    onSuccess: () => {
      invalidate(queryClient);
      showToast('Đã cập nhật trạng thái bàn', 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err.response?.data?.message ?? 'Không thể đổi trạng thái', 'error');
    },
  });
};

export const useReserveTable = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReserveTableDto }) =>
      tableService.reserveTable(id, payload),
    onSuccess: () => {
      invalidate(queryClient);
      showToast('Đã đặt bàn trước', 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err.response?.data?.message ?? 'Không thể đặt bàn', 'error');
    },
  });
};

export const useCancelTableOrder = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (orderId: string) => tableService.cancelOrder(orderId),
    onSuccess: () => {
      invalidate(queryClient);
      showToast('Đã hủy order', 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err.response?.data?.message ?? 'Không thể hủy order', 'error');
    },
  });
};

export const useCreateTableOrder = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      tableId,
      payload,
    }: {
      tableId: string;
      payload: CreateTableOrderDto;
    }) => tableService.createOrder(tableId, payload),
    onSuccess: () => {
      invalidate(queryClient);
      showToast('Đã gửi order tới bếp', 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err.response?.data?.message ?? 'Không thể gửi order', 'error');
    },
  });
};

export const useCreateTableNote = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({
      tableId,
      type,
      content,
    }: {
      tableId: string;
      type: TableNoteType;
      content: string;
    }) => tableService.createNote(tableId, { type, content }),
    onSuccess: () => {
      invalidate(queryClient);
      showToast('Đã thêm ghi chú', 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err.response?.data?.message ?? 'Không thể thêm ghi chú', 'error');
    },
  });
};

export const useMarkTableNoteDone = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (noteId: string) => tableService.markNoteDone(noteId),
    onSuccess: () => {
      invalidate(queryClient);
      showToast('Đã hoàn thành ghi chú', 'success');
    },
    onError: () => showToast('Không thể cập nhật ghi chú', 'error'),
  });
};
