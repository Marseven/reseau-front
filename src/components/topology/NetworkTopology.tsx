import { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { useTopology } from '@/hooks/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import EquipementNode from './EquipementNode';

const nodeTypes = { equipement: EquipementNode };

const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;

function layoutGraph(nodes: Node[], edges: Edge[], direction = 'LR') {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 120 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });
}

export default function NetworkTopology() {
  const [classification, setClassification] = useState<string>('');
  const params = useMemo(() => {
    const p: any = {};
    if (classification) p.classification = classification;
    return p;
  }, [classification]);

  const { data: topology, isLoading } = useTopology(params);

  const { nodes, edges } = useMemo(() => {
    if (!topology) return { nodes: [], edges: [] };

    const rawNodes: Node[] = topology.nodes.map((eq: any) => ({
      id: String(eq.id),
      type: 'equipement',
      position: { x: 0, y: 0 },
      data: {
        label: eq.name,
        type: eq.type,
        classification: eq.classification,
        status: eq.status,
        ip_address: eq.ip_address,
      },
    }));

    const rawEdges: Edge[] = topology.edges.map((l: any) => ({
      id: `e${l.id}`,
      source: String(l.from),
      target: String(l.to),
      label: l.label || '',
      animated: l.status === true || l.status === 1,
      style: { stroke: '#94a3b8' },
    }));

    const layouted = layoutGraph(rawNodes, rawEdges);
    return { nodes: layouted, edges: rawEdges };
  }, [topology]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-10">
        Aucun equipement a afficher dans la topologie.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Classification :</span>
        <Select value={classification} onValueChange={(v) => setClassification(v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Toutes</SelectItem>
            <SelectItem value="IT">IT</SelectItem>
            <SelectItem value="OT">OT</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ height: 500 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
