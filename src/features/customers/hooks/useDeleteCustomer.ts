import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { customerService } from '../services';
import { CUSTOMERS_QUERY_KEY } from './useCustomers';

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => customerService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      const previous = queryClient.getQueriesData({ queryKey: [CUSTOMERS_QUERY_KEY] });
      queryClient.setQueriesData(
        { queryKey: [CUSTOMERS_QUERY_KEY] },
        (old: { data: { id: string }[]; total: number } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((c) => c.id !== id),
            total: old.total - 1,
          };
        },
      );
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      showToast('Xóa khách hàng thành công', 'success');
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      showToast('Không thể xóa khách hàng', 'error');
    },
  });
};
