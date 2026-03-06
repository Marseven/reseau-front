import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { Port, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function usePorts(params?: ListParams) {
  return useQuery({
    queryKey: ['ports', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Port>>>('/ports', { params });
      return data.data;
    },
  });
}

export function usePort(id: number | undefined) {
  return useQuery({
    queryKey: ['ports', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Port>>(`/ports/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreatePort() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Port>) => {
      const { data } = await api.post<ApiResponse<Port>>('/ports', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ports'] }),
  });
}

export function useUpdatePort() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Port> & { id: number }) => {
      const { data } = await api.put<ApiResponse<Port>>(`/ports/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ports'] }),
  });
}

export function useDeletePort() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/ports/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ports'] }),
  });
}
