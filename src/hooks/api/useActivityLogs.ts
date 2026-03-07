import { useQuery } from '@tanstack/react-query';
import api from '@/axios';
import type { ApiResponse, PaginatedData, ActivityLog, ListParams } from '@/types/api';

export function useCoffretHistory(coffretId: number | undefined, params?: ListParams) {
  return useQuery({
    queryKey: ['coffret-history', coffretId, params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<ActivityLog>>>(
        `/coffrets/${coffretId}/history`,
        { params }
      );
      return data.data;
    },
    enabled: !!coffretId,
  });
}

export function useActivityLogs(params?: ListParams) {
  return useQuery({
    queryKey: ['activity-logs', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<ActivityLog>>>('/activity-logs', { params });
      return data.data;
    },
  });
}
