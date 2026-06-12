import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { userService } from '../services';
import type { CreateUserDto } from '../types/auth.types';

export const USERS_QUERY_KEY = 'users';

export const useUsers = (enabled = true) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY],
    queryFn: () => userService.list(),
    enabled,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (dto: CreateUserDto) => userService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      showToast('Đã tạo tài khoản mới', 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err.response?.data?.message ?? 'Không thể tạo tài khoản', 'error');
    },
  });
};
