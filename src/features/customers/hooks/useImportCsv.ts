import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { customerService } from '../services';
import { CUSTOMERS_QUERY_KEY } from './useCustomers';

export const useImportCsv = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (csv: string) => customerService.importCsv(csv),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      showToast(
        `Import xong: ${result.imported} thành công, ${result.skipped} bỏ qua`,
        result.imported > 0 ? 'success' : 'info',
      );
    },
    onError: () => showToast('Không thể import CSV', 'error'),
  });
};
