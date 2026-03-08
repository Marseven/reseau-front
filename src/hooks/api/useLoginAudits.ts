import { useQuery } from '@tanstack/react-query';
import api from '@/axios';
import type { LoginAudit, ApiResponse, PaginatedData, ListParams } from '@/types/api';

export function useMyLoginHistory(params?: ListParams) {
  return useQuery({
    queryKey: ['login-audits', 'me', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<LoginAudit>>>('/login-audits/me', { params });
      return data.data;
    },
  });
}

export function useLoginAudits(params?: ListParams) {
  return useQuery({
    queryKey: ['login-audits', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<LoginAudit>>>('/login-audits', { params });
      return data.data;
    },
  });
}
