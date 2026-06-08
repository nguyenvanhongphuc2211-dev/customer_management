import { useQuery } from '@tanstack/react-query';
import { customerService } from '../services';
import type { GetCustomersParams } from '../types/customer.types';

export const CUSTOMERS_QUERY_KEY = 'customers';

export const useCustomers = (params: GetCustomersParams) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, params],
    queryFn: () => customerService.getAll(params),
  });
};
