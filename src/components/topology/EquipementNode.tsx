import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  active: 'border-green-500',
  inactive: 'border-red-500',
  maintenance: 'border-yellow-500',
};

const classificationColors: Record<string, string> = {
  IT: 'bg-blue-50 border-blue-300',
  OT: 'bg-orange-50 border-orange-300',
};

function EquipementNode({ data }: NodeProps) {
  const nodeData = data as any;
  const borderClass = statusColors[nodeData.status] || 'border-gray-400';
  const bgClass = classificationColors[nodeData.classification] || 'bg-white border-gray-200';

  return (
    <div className={`px-3 py-2 rounded-lg border-2 shadow-sm min-w-[140px] ${bgClass} ${borderClass}`}>
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <div className="text-xs font-bold truncate">{nodeData.label}</div>
      <div className="text-[10px] text-gray-500">{nodeData.type}</div>
      {nodeData.ip_address && (
        <div className="text-[10px] font-mono text-gray-400">{nodeData.ip_address}</div>
      )}
      <div className="flex items-center gap-1 mt-1">
        <Badge variant="outline" className="text-[9px] px-1 py-0">
          {nodeData.classification || '-'}
        </Badge>
        <Badge
          variant={nodeData.status === 'active' ? 'default' : 'secondary'}
          className="text-[9px] px-1 py-0"
        >
          {nodeData.status}
        </Badge>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </div>
  );
}

export default memo(EquipementNode);
