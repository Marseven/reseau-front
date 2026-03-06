import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { Site, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useSites(params?: ListParams) {
  return useQuery({
    queryKey: ['sites', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Site>>>('/sites', { params });
      return data.data;
    },
  });
}

export function useSite(id: number | undefined) {
  return useQuery({
    queryKey: ['sites', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Site>>(`/sites/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Site>) => {
      const { data } = await api.post<ApiResponse<Site>>('/sites', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sites'] }),
  });
}

export function useUpdateSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Site> & { id: number }) => {
      const { data } = await api.put<ApiResponse<Site>>(`/sites/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sites'] }),
  });
}

export function useDeleteSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/sites/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sites'] }),
  });
}
