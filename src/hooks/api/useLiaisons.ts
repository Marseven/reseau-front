import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { Liaison, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useLiaisons(params?: ListParams) {
  return useQuery({
    queryKey: ['liaisons', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Liaison>>>('/liaisons', { params });
      return data.data;
    },
  });
}

export function useLiaison(id: number | undefined) {
  return useQuery({
    queryKey: ['liaisons', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Liaison>>(`/liaisons/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateLiaison() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Liaison>) => {
      const { data } = await api.post<ApiResponse<Liaison>>('/liaisons', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['liaisons'] }),
  });
}

export function useUpdateLiaison() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Liaison> & { id: number }) => {
      const { data } = await api.put<ApiResponse<Liaison>>(`/liaisons/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['liaisons'] }),
  });
}

export function useDeleteLiaison() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/liaisons/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['liaisons'] }),
  });
}
