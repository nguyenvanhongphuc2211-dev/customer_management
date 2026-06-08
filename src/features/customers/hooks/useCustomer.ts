import { useQuery } from '@tanstack/react-query';
import { customerService } from '../services';

export const useCustomer = (id: string | null) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getById(id!),
    enabled: !!id,
  });
};
