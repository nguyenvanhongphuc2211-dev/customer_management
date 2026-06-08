import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { customerService } from '../services';
import type { BulkActionDto } from '../types/customer.types';
import { CUSTOMERS_QUERY_KEY } from './useCustomers';

export const useBulkAction = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: BulkActionDto) => customerService.bulkAction(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      showToast(`Đã xử lý ${data.affected} khách hàng`, 'success');
    },
    onError: () => showToast('Không thể thực hiện thao tác hàng loạt', 'error'),
  });
};
