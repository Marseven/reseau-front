import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/axios';
import type { ApiResponse } from '@/types/api';

// Types
export interface ReportSummary {
  period: { from: string; to: string };
  modifications: { total: number; by_action: Record<string, number> };
  interventions: { total: number; by_status: Record<string, number> };
  sites_count: number;
}

export interface ExportParams {
  site_id?: number;
  equipement_id?: number;
  from?: string;
  to?: string;
  technicien_id?: number;
}

// Helpers
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function extractFilename(headers: any, fallback: string): string {
  const disposition = headers['content-disposition'];
  if (disposition) {
    const match = disposition.match(/filename="?([^";\s]+)"?/);
    if (match) return match[1];
  }
  return fallback;
}

async function downloadExport(url: string, params: Record<string, any> | undefined, fallbackFilename: string) {
  const response = await api.get(url, { params, responseType: 'blob' });
  const filename = extractFilename(response.headers, fallbackFilename);
  downloadBlob(response.data, filename);
}

// CSV Export hooks
export function useExportEquipementsCsv() {
  return useMutation({
    mutationFn: (params?: ExportParams) =>
      downloadExport('/exports/equipements/csv', params, 'equipements.csv'),
  });
}

export function useExportCoffretsCsv() {
  return useMutation({
    mutationFn: (params?: ExportParams) =>
      downloadExport('/exports/coffrets/csv', params, 'coffrets.csv'),
  });
}

export function useExportPortsCsv() {
  return useMutation({
    mutationFn: (params?: ExportParams) =>
      downloadExport('/exports/ports/csv', params, 'ports.csv'),
  });
}

export function useExportLiaisonsCsv() {
  return useMutation({
    mutationFn: () => downloadExport('/exports/liaisons/csv', undefined, 'liaisons.csv'),
  });
}

export function useExportActivityLogsCsv() {
  return useMutation({
    mutationFn: (params?: ExportParams) =>
      downloadExport('/exports/activity-logs/csv', params, 'historique.csv'),
  });
}

// PDF Export hooks
export function useExportArchitecturePdf() {
  return useMutation({
    mutationFn: () => downloadExport('/exports/architecture/pdf', undefined, 'architecture-reseau.pdf'),
  });
}

export function useReportNetworkStatusPdf() {
  return useMutation({
    mutationFn: () => downloadExport('/reports/network-status/pdf', undefined, 'statut-reseau.pdf'),
  });
}

export function useReportModificationsPdf() {
  return useMutation({
    mutationFn: (params: ExportParams) =>
      downloadExport('/reports/modifications/pdf', params, 'modifications.pdf'),
  });
}

export function useReportInterventionsPdf() {
  return useMutation({
    mutationFn: (params?: ExportParams) =>
      downloadExport('/reports/interventions/pdf', params, 'interventions.pdf'),
  });
}

export function useReportSiteArchitecturePdf() {
  return useMutation({
    mutationFn: ({ siteId }: { siteId: number }) =>
      downloadExport(`/reports/site/${siteId}/architecture/pdf`, undefined, `architecture-site-${siteId}.pdf`),
  });
}

// Query hook
export function useReportSummary(params?: ExportParams) {
  return useQuery({
    queryKey: ['report-summary', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ReportSummary>>('/reports/summary', { params });
      return data.data;
    },
  });
}
