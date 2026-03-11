import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  active: 'border-green-500',
  inactive: 'border-red-500',
  maintenance: 'border-yellow-500',
};

const classificationColors: Record<string, string> = {
  IT: 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700',
  OT: 'bg-orange-50 dark:bg-orange-950 border-orange-300 dark:border-orange-700',
};

const statusLabels: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  maintenance: 'Maintenance',
};

function EquipementNode({ data, selected }: NodeProps) {
  const nodeData = data as any;
  const borderClass = statusColors[nodeData.status] || 'border-gray-400 dark:border-gray-600';
  const bgClass = classificationColors[nodeData.classification] || 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600';

  return (
    <div
      className={`px-3 py-2 rounded-lg border-2 shadow-sm min-w-[140px] transition-all duration-150 hover:shadow-md hover:scale-105 ${bgClass} ${borderClass} ${selected ? 'ring-2 ring-primary ring-offset-1 shadow-lg' : ''}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400 dark:!bg-gray-500" />
      <div className="text-xs font-bold truncate text-gray-900 dark:text-gray-100">{nodeData.label}</div>
      <div className="text-[10px] text-gray-500 dark:text-gray-400">{nodeData.type}</div>
      {nodeData.ip_address && (
        <div className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{nodeData.ip_address}</div>
      )}
      <div className="flex items-center gap-1 mt-1">
        <Badge variant="outline" className="text-[9px] px-1 py-0">
          {nodeData.classification || '-'}
        </Badge>
        <Badge
          variant={nodeData.status === 'active' ? 'default' : 'secondary'}
          className="text-[9px] px-1 py-0"
        >
          {statusLabels[nodeData.status] || nodeData.status}
        </Badge>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400 dark:!bg-gray-500" />
    </div>
  );
}

export default memo(EquipementNode);
