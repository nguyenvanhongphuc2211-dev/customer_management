import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { menuService } from '../services';
import type { CreateMenuItemDto, UpdateMenuItemDto } from '../types/menu.types';

export const MENU_QUERY_KEY = 'menu';

export const useMenuItems = (enabled = true) => {
  return useQuery({
    queryKey: [MENU_QUERY_KEY],
    queryFn: () => menuService.list(),
    enabled,
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (dto: CreateMenuItemDto) => menuService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENU_QUERY_KEY] });
      showToast('Đã thêm món vào thực đơn', 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err.response?.data?.message ?? 'Không thể thêm món', 'error');
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMenuItemDto }) => menuService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENU_QUERY_KEY] });
      showToast('Đã cập nhật món', 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err.response?.data?.message ?? 'Không thể cập nhật món', 'error');
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => menuService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENU_QUERY_KEY] });
      showToast('Đã xóa món khỏi thực đơn', 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast(err.response?.data?.message ?? 'Không thể xóa món', 'error');
    },
  });
};
