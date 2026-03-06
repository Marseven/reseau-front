import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { Batiment, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useBatiments(params?: ListParams) {
  return useQuery({
    queryKey: ['batiments', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Batiment>>>('/batiments', { params });
      return data.data;
    },
  });
}

export function useBatiment(id: number | undefined) {
  return useQuery({
    queryKey: ['batiments', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Batiment>>(`/batiments/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateBatiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Batiment>) => {
      const { data } = await api.post<ApiResponse<Batiment>>('/batiments', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['batiments'] }),
  });
}

export function useUpdateBatiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Batiment> & { id: number }) => {
      const { data } = await api.put<ApiResponse<Batiment>>(`/batiments/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['batiments'] }),
  });
}

export function useDeleteBatiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/batiments/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['batiments'] }),
  });
}
