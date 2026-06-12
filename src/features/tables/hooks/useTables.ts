import { useQuery } from '@tanstack/react-query';
import { tableService } from '../services';
import type { GetTablesParams } from '../types/table.types';

export const TABLES_QUERY_KEY = 'tables';
export const TABLE_AREAS_QUERY_KEY = 'table-areas';

export const useTableAreas = () => {
  return useQuery({
    queryKey: [TABLE_AREAS_QUERY_KEY],
    queryFn: () => tableService.getAreas(),
  });
};

export const useTables = (params?: GetTablesParams) => {
  return useQuery({
    queryKey: [TABLES_QUERY_KEY, params],
    queryFn: () => tableService.getAll(params),
    refetchInterval: 10_000,
  });
};

export const useTable = (id: string | null) => {
  return useQuery({
    queryKey: ['table', id],
    queryFn: () => tableService.getById(id!),
    enabled: !!id,
    refetchInterval: 5_000,
  });
};

export const usePendingTableNotes = () => {
  return useQuery({
    queryKey: ['table-notes-pending'],
    queryFn: () => tableService.getPendingNotes(),
    refetchInterval: 8_000,
  });
};
