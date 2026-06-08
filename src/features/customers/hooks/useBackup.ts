import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { customerService } from '../services';

export const useBackups = () => {
  return useQuery({
    queryKey: ['backups'],
    queryFn: () => customerService.listBackups(),
  });
};

export const useCreateBackup = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: () => customerService.createBackup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      showToast('Tạo backup thành công', 'success');
    },
    onError: () => showToast('Không thể tạo backup', 'error'),
  });
};

export const useRestoreBackup = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => customerService.restoreBackup(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      showToast('Khôi phục dữ liệu thành công', 'success');
    },
    onError: () => showToast('Không thể khôi phục dữ liệu', 'error'),
  });
};
