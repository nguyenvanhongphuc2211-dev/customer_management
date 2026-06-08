import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/contexts/ToastContext';
import { customerService } from '../services';
import type { CreateContactNoteDto } from '../types/customer.types';
import { CUSTOMERS_QUERY_KEY } from './useCustomers';

export const useContactNotes = (customerId: string) => {
  return useQuery({
    queryKey: ['contact-notes', customerId],
    queryFn: () => customerService.getContactNotes(customerId),
    enabled: !!customerId,
  });
};

export const useCreateContactNote = (customerId: string) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: Omit<CreateContactNoteDto, 'customerId'>) =>
      customerService.createContactNote({ ...payload, customerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes', customerId] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      showToast('Thêm ghi chú thành công', 'success');
    },
    onError: () => showToast('Không thể thêm ghi chú', 'error'),
  });
};
