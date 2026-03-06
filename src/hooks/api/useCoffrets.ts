import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { Coffret, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useCoffrets(params?: ListParams) {
  return useQuery({
    queryKey: ['coffrets', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Coffret>>>('/coffrets', { params });
      return data.data;
    },
  });
}

export function useCoffret(id: number | undefined) {
  return useQuery({
    queryKey: ['coffrets', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Coffret>>(`/coffrets/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCoffret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Coffret>) => {
      const { data } = await api.post<ApiResponse<Coffret>>('/coffrets', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coffrets'] }),
  });
}

export function useUpdateCoffret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Coffret> & { id: number }) => {
      const { data } = await api.put<ApiResponse<Coffret>>(`/coffrets/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coffrets'] }),
  });
}

export function useDeleteCoffret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/coffrets/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coffrets'] }),
  });
}
