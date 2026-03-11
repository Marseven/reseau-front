import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { ApiResponse } from '@/types/api';

type SettingsMap = Record<string, string>;

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SettingsMap>>('/settings');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const { data } = await api.put<ApiResponse<SettingsMap>>('/settings', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
