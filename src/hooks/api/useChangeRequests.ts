import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { ChangeRequest, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useChangeRequests(params?: ListParams) {
  return useQuery({
    queryKey: ['change-requests', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<ChangeRequest>>>('/change-requests', { params });
      return data.data;
    },
  });
}

export function useChangeRequest(id: number | undefined) {
  return useQuery({
    queryKey: ['change-requests', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ChangeRequest>>(`/change-requests/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateChangeRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post<ApiResponse<ChangeRequest>>('/change-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['change-requests'] });
      qc.invalidateQueries({ queryKey: ['coffrets'] });
    },
  });
}

export function useReviewChangeRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number; status: string; review_comment?: string }) => {
      const { data } = await api.put<ApiResponse<ChangeRequest>>(`/change-requests/${id}/review`, payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['change-requests'] });
      qc.invalidateQueries({ queryKey: ['coffrets'] });
    },
  });
}

export function useDeleteChangeRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/change-requests/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['change-requests'] }),
  });
}
