import { useQuery } from '@tanstack/react-query';
import { customerService } from '../services';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => customerService.getAnalytics(),
  });
};
