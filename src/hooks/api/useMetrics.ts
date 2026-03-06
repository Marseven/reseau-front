import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { Metric, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useMetrics(params?: ListParams) {
  return useQuery({
    queryKey: ['metrics', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<Metric>>>('/metrics', { params });
      return data.data;
    },
  });
}

export function useMetric(id: number | undefined) {
  return useQuery({
    queryKey: ['metrics', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Metric>>(`/metrics/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Metric>) => {
      const { data } = await api.post<ApiResponse<Metric>>('/metrics', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['metrics'] }),
  });
}

export function useUpdateMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Metric> & { id: number }) => {
      const { data } = await api.put<ApiResponse<Metric>>(`/metrics/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['metrics'] }),
  });
}

export function useDeleteMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/metrics/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['metrics'] }),
  });
}
