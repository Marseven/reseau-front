import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { Maintenance, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useMaintenances(params?: ListParams) {
  return useQuery({
    queryKey: ['maintenances', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Maintenance>>>('/maintenances', { params });
      return data.data;
    },
  });
}

export function useMaintenance(id: number | undefined) {
  return useQuery({
    queryKey: ['maintenances', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Maintenance>>(`/maintenances/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Maintenance>) => {
      const { data } = await api.post<ApiResponse<Maintenance>>('/maintenances', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenances'] }),
  });
}

export function useUpdateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Maintenance> & { id: number }) => {
      const { data } = await api.put<ApiResponse<Maintenance>>(`/maintenances/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenances'] }),
  });
}

export function useDeleteMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/maintenances/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenances'] }),
  });
}
