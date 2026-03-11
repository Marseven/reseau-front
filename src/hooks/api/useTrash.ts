import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { ApiResponse, PaginatedData, ListParams } from '@/types/api';

export type TrashResource =
  | 'coffrets'
  | 'equipements'
  | 'ports'
  | 'liaisons'
  | 'systems'
  | 'maintenances'
  | 'sites'
  | 'zones'
  | 'batiments'
  | 'salles'
  | 'vlans';

export function useTrash(resource: TrashResource, params?: ListParams) {
  return useQuery({
    queryKey: ['trash', resource, params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<any>>>(`/trash/${resource}`, { params });
      return data.data;
    },
  });
}

export function useRestoreItem(resource: TrashResource) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<ApiResponse<any>>(`/trash/${resource}/${id}/restore`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash', resource] });
      queryClient.invalidateQueries({ queryKey: [resource] });
    },
  });
}

export function useForceDeleteItem(resource: TrashResource) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete<ApiResponse<any>>(`/trash/${resource}/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash', resource] });
    },
  });
}
