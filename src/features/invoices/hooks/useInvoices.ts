import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { invoiceService } from '../services';
import { TABLES_QUERY_KEY } from '@/features/tables/hooks/useTables';
import type { CreateInvoiceDto } from '../types/invoice.types';

export const INVOICES_QUERY_KEY = 'invoices';

export const useInvoices = (enabled = true) => {
  return useQuery({
    queryKey: [INVOICES_QUERY_KEY],
    queryFn: () => invoiceService.list(),
    enabled,
    refetchInterval: 10_000,
  });
};

export const useInvoiceDraft = (tableId: string | null) => {
  return useQuery({
    queryKey: ['invoice-draft', tableId],
    queryFn: () => invoiceService.getDraftItems(tableId!),
    enabled: !!tableId,
    staleTime: 30_000,
    retry: 1,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (dto: CreateInvoiceDto) => invoiceService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TABLES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['table'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-draft'] });
      showToast('Đã lưu hóa đơn — bàn chuyển dọn bàn', 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err.response?.data?.message ?? 'Không thể lưu hóa đơn', 'error');
    },
  });
};

export const useExportInvoice = () => {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, invoiceNumber }: { id: string; invoiceNumber: string }) =>
      invoiceService.exportFile(id, invoiceNumber),
    onSuccess: () => showToast('Đã xuất hóa đơn', 'success'),
    onError: () => showToast('Không thể xuất hóa đơn', 'error'),
  });
};
