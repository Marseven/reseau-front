import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { SystemModel, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useSystems(params?: ListParams) {
  return useQuery({
    queryKey: ['systems', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<SystemModel>>>('/systems', { params });
      return data.data;
    },
  });
}

export function useSystem(id: number | undefined) {
  return useQuery({
    queryKey: ['systems', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SystemModel>>(`/systems/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateSystem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<SystemModel>) => {
      const { data } = await api.post<ApiResponse<SystemModel>>('/systems', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['systems'] }),
  });
}

export function useUpdateSystem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<SystemModel> & { id: number }) => {
      const { data } = await api.put<ApiResponse<SystemModel>>(`/systems/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['systems'] }),
  });
}

export function useDeleteSystem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/systems/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['systems'] }),
  });
}
