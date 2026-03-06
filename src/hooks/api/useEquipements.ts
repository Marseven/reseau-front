import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { Equipement, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useEquipements(params?: ListParams) {
  return useQuery({
    queryKey: ['equipements', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Equipement>>>('/equipements', { params });
      return data.data;
    },
  });
}

export function useEquipement(id: number | undefined) {
  return useQuery({
    queryKey: ['equipements', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Equipement>>(`/equipements/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateEquipement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Equipement>) => {
      const { data } = await api.post<ApiResponse<Equipement>>('/equipements', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipements'] }),
  });
}

export function useUpdateEquipement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Equipement> & { id: number }) => {
      const { data } = await api.put<ApiResponse<Equipement>>(`/equipements/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipements'] }),
  });
}

export function useDeleteEquipement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/equipements/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['equipements'] }),
  });
}
