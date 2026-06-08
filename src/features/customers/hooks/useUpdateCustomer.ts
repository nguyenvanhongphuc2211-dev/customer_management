import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { customerService } from '../services';
import type { UpdateCustomerDto } from '../types/customer.types';
import { CUSTOMERS_QUERY_KEY } from './useCustomers';

interface UpdateCustomerVariables {
  id: string;
  payload: UpdateCustomerDto;
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateCustomerVariables) =>
      customerService.update(id, payload),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      const previous = queryClient.getQueriesData({ queryKey: [CUSTOMERS_QUERY_KEY] });
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      showToast('Cập nhật khách hàng thành công', 'success');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      showToast('Không thể cập nhật khách hàng', 'error');
    },
  });
};
