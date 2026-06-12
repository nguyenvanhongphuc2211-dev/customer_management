import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { customerService } from '../services';
import { CUSTOMERS_QUERY_KEY } from './useCustomers';

export const useRestoreCustomer = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => customerService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      showToast('Khôi phục khách hàng thành công', 'success');
    },
    onError: () => showToast('Không thể khôi phục khách hàng', 'error'),
  });
};

export const usePermanentDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => customerService.permanentDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      showToast('Đã xóa vĩnh viễn', 'success');
    },
    onError: () => showToast('Không thể xóa vĩnh viễn', 'error'),
  });
};
