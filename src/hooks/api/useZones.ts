import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { Zone, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useZones(params?: ListParams) {
  return useQuery({
    queryKey: ['zones', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Zone>>>('/zones', { params });
      return data.data;
    },
  });
}

export function useZone(id: number | undefined) {
  return useQuery({
    queryKey: ['zones', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Zone>>(`/zones/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Zone>) => {
      const { data } = await api.post<ApiResponse<Zone>>('/zones', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones'] }),
  });
}

export function useUpdateZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Zone> & { id: number }) => {
      const { data } = await api.put<ApiResponse<Zone>>(`/zones/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones'] }),
  });
}

export function useDeleteZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/zones/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones'] }),
  });
}
