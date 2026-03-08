import { useQuery } from '@tanstack/react-query';
import api from '@/axios';
import type { Equipement, Liaison, ApiResponse } from '@/types/api';

interface TopologyData {
  nodes: Equipement[];
  edges: Liaison[];
}

export function useTopology(params?: { classification?: string; coffret_id?: number }) {
  return useQuery({
    queryKey: ['topology', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TopologyData>>('/topology', { params });
      return data.data;
    },
  });
}
