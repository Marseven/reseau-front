import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios';

export interface ImportResult {
  imported: number;
  updated: number;
  errors: Array<{ line: number; message: string }>;
}

type ResourceType = 'coffrets' | 'equipements' | 'ports' | 'liaisons';

function useImportCsv(resource: ResourceType, invalidateKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(`/imports/${resource}/csv`, formData, {
        headers: { 'Content-Type': undefined },
      });
      return data.data as ImportResult;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [invalidateKey] }),
  });
}

export function useImportCoffretsCsv() {
  return useImportCsv('coffrets', 'coffrets');
}

export function useImportEquipementsCsv() {
  return useImportCsv('equipements', 'equipements');
}

export function useImportPortsCsv() {
  return useImportCsv('ports', 'ports');
}

export function useImportLiaisonsCsv() {
  return useImportCsv('liaisons', 'liaisons');
}

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

export function useDownloadTemplate() {
  return useMutation({
    mutationFn: async (resource: ResourceType) => {
      const response = await api.get(`/imports/${resource}/template`, {
        responseType: 'blob',
      });
      downloadBlob(response.data, `template-${resource}.csv`);
    },
  });
}
