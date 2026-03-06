import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { Vlan, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useVlans(params?: ListParams) {
  return useQuery({
    queryKey: ['vlans', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Vlan>>>('/vlans', { params });
      return data.data;
    },
  });
}

export function useVlan(id: number | undefined) {
  return useQuery({
    queryKey: ['vlans', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Vlan>>(`/vlans/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateVlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Vlan>) => {
      const { data } = await api.post<ApiResponse<Vlan>>('/vlans', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vlans'] }),
  });
}

export function useUpdateVlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Vlan> & { id: number }) => {
      const { data } = await api.put<ApiResponse<Vlan>>(`/vlans/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vlans'] }),
  });
}

export function useDeleteVlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/vlans/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vlans'] }),
  });
}
