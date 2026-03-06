import { useQuery } from '@tanstack/react-query';
import api from '@/axios';
import type { ApiResponse } from '@/types/api';

export function useGlobalStats() {
  return useQuery({
    queryKey: ['stats', 'global'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Record<string, any>>>('/stats/global');
      return data.data;
    },
  });
}

export function useSystemsByType() {
  return useQuery({
    queryKey: ['stats', 'systems-by-type'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any[]>>('/stats/systems-by-type');
      return data.data;
    },
  });
}

export function useEquipementsByCoffret() {
  return useQuery({
    queryKey: ['stats', 'equipements-by-coffret'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any[]>>('/stats/equipements-by-coffret');
      return data.data;
    },
  });
}

export function usePortsByVlan() {
  return useQuery({
    queryKey: ['stats', 'ports-by-vlan'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any[]>>('/stats/ports-by-vlan');
      return data.data;
    },
  });
}
