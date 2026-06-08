import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { customerService } from '../services';
import type { CreateCustomerDto } from '../types/customer.types';
import { CUSTOMERS_QUERY_KEY } from './useCustomers';

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateCustomerDto) => customerService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      showToast('Tạo khách hàng thành công', 'success');
    },
    onError: (error: { response?: { status?: number; data?: { message?: string } } }) => {
      const message =
        error.response?.status === 409
          ? 'Email hoặc số điện thoại đã tồn tại'
          : (error.response?.data?.message ?? 'Không thể tạo khách hàng');
      showToast(message, 'error');
    },
  });
};
