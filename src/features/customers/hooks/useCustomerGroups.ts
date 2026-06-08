import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { customerService } from '../services';
import type { CreateCustomerGroupDto, UpdateCustomerGroupDto } from '../types/customer.types';
import { CUSTOMERS_QUERY_KEY } from './useCustomers';

export const CUSTOMER_GROUPS_QUERY_KEY = 'customer-groups';

export const useCustomerGroups = () => {
  return useQuery({
    queryKey: [CUSTOMER_GROUPS_QUERY_KEY],
    queryFn: () => customerService.getGroups(),
  });
};

export const useCreateCustomerGroup = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateCustomerGroupDto) => customerService.createGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_GROUPS_QUERY_KEY] });
      showToast('Tạo nhóm khách hàng thành công', 'success');
    },
    onError: () => showToast('Không thể tạo nhóm khách hàng', 'error'),
  });
};

export const useUpdateCustomerGroup = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerGroupDto }) =>
      customerService.updateGroup(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_GROUPS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      showToast('Cập nhật nhóm thành công', 'success');
    },
    onError: () => showToast('Không thể cập nhật nhóm', 'error'),
  });
};

export const useDeleteCustomerGroup = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => customerService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_GROUPS_QUERY_KEY] });
      showToast('Xóa nhóm thành công', 'success');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message =
        error.response?.data?.message ?? 'Không thể xóa nhóm khách hàng';
      showToast(message, 'error');
    },
  });
};
