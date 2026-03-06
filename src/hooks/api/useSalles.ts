import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { Salle, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useSalles(params?: ListParams) {
  return useQuery({
    queryKey: ['salles', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Salle>>>('/salles', { params });
      return data.data;
    },
  });
}

export function useSalle(id: number | undefined) {
  return useQuery({
    queryKey: ['salles', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Salle>>(`/salles/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateSalle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Salle>) => {
      const { data } = await api.post<ApiResponse<Salle>>('/salles', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salles'] }),
  });
}

export function useUpdateSalle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Salle> & { id: number }) => {
      const { data } = await api.put<ApiResponse<Salle>>(`/salles/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salles'] }),
  });
}

export function useDeleteSalle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/salles/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['salles'] }),
  });
}
