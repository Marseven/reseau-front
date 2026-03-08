import { useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';
import type { ApiResponse, NotificationsResponse, AppNotification, ListParams } from '@/types/api';
import { showBrowserNotification } from '@/hooks/useNotificationPermission';

export function useNotifications(params?: ListParams) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<NotificationsResponse>>('/notifications', { params });
      return data.data;
    },
    refetchInterval: 30_000,
  });
}

export function useUnreadCount() {
  const prevCountRef = useRef<number | null>(null);

  const query = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<NotificationsResponse>>('/notifications', {
        params: { per_page: 1 },
      });
      return data.data.unread_count;
    },
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (query.data == null) return;
    const current = query.data;
    const prev = prevCountRef.current;
    if (prev !== null && current > prev) {
      showBrowserNotification(
        'ReseauApp',
        `Vous avez ${current} notification${current > 1 ? 's' : ''} non lue${current > 1 ? 's' : ''}`
      );
    }
    prevCountRef.current = current;
  }, [query.data]);

  return query;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.put<ApiResponse<AppNotification>>(`/notifications/${id}/read`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.put('/notifications/read-all');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
