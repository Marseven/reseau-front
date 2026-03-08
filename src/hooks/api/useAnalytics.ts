import { useQuery } from '@tanstack/react-query';
import api from '@/axios';
import type { ApiResponse } from '@/types/api';

export interface AnalyticsItem {
  [key: string]: string | number;
}

export interface PortUtilization {
  total: number;
  connected: number;
  free: number;
  utilization_percent: number;
}

export interface SiteSummary {
  id: number;
  name: string;
  code: string;
  zones_count: number;
  coffrets_count: number;
  equipements_count: number;
  maintenance_active_count: number;
}

function useAnalyticsQuery<T = AnalyticsItem[]>(endpoint: string, key: string) {
  return useQuery({
    queryKey: ['analytics', key],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<T>>(`/analytics/${endpoint}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useEquipementsByType() {
  return useAnalyticsQuery('equipements-by-type', 'equipements-by-type');
}

export function useEquipementsByClassification() {
  return useAnalyticsQuery('equipements-by-classification', 'equipements-by-classification');
}

export function useEquipementsByStatus() {
  return useAnalyticsQuery('equipements-by-status', 'equipements-by-status');
}

export function useEquipementsByVendor() {
  return useAnalyticsQuery('equipements-by-vendor', 'equipements-by-vendor');
}

export function useMaintenanceTrends() {
  return useAnalyticsQuery('maintenance-trends', 'maintenance-trends');
}

export function usePortUtilization() {
  return useAnalyticsQuery<PortUtilization>('port-utilization', 'port-utilization');
}

export function useSitesSummary() {
  return useAnalyticsQuery<SiteSummary[]>('sites-summary', 'sites-summary');
}
