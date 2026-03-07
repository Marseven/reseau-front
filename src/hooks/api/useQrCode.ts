import { useQuery } from '@tanstack/react-query';
import api from '@/axios';
import type { Coffret, Equipement, ApiResponse } from '@/types/api';

export function useCoffretByQrToken(token: string | undefined) {
  return useQuery({
    queryKey: ['qr', 'coffret', token],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Coffret>>(`/qr/coffret/${token}`);
      return data.data;
    },
    enabled: !!token,
    retry: false,
  });
}

export function useEquipementByQrToken(token: string | undefined) {
  return useQuery({
    queryKey: ['qr', 'equipement', token],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Equipement>>(`/qr/equipement/${token}`);
      return data.data;
    },
    enabled: !!token,
    retry: false,
  });
}
