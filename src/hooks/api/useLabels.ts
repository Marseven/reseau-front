import { useMutation } from '@tanstack/react-query';
import api from '@/axios';

export type LabelFormat = 'small' | 'medium' | 'large';

interface LabelPayload {
  ids: number[];
  format: LabelFormat;
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

export function useGenerateCoffretLabels() {
  return useMutation({
    mutationFn: async (payload: LabelPayload) => {
      const response = await api.post('/labels/coffrets', payload, { responseType: 'blob' });
      downloadBlob(response.data, 'etiquettes-coffrets.pdf');
    },
  });
}

export function useGenerateEquipementLabels() {
  return useMutation({
    mutationFn: async (payload: LabelPayload) => {
      const response = await api.post('/labels/equipements', payload, { responseType: 'blob' });
      downloadBlob(response.data, 'etiquettes-equipements.pdf');
    },
  });
}
