import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { ApiResponse } from '@/types/api';

interface UpdateProfilePayload {
  name: string;
  surname?: string;
  email: string;
  phone?: string;
}

interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await api.put<ApiResponse<any>>('/auth/profile', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth'] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const { data } = await api.put<ApiResponse<any>>('/auth/password', payload);
      return data.data;
    },
  });
}
