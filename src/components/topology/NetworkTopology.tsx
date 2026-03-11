import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { useTopology } from '@/hooks/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Server, Wifi, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const statusLabels: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  maintenance: 'Maintenance',
};

interface SelectedNodeData {
  id: string;
  label: string;
  type: string;
  classification: string;
  status: string;
  ip_address: string;
  coffret_name?: string;
  equipement_code?: string;
}

interface EdgeTooltip {
  x: number;
  y: number;
  label: string;
  media: string;
  length: string;
  status: boolean;
}

export default function NetworkTopology() {
  const [classification, setClassification] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<SelectedNodeData | null>(null);
  const [edgeTooltip, setEdgeTooltip] = useState<EdgeTooltip | null>(null);

  const params = useMemo(() => {
    const p: any = {};
    if (classification) p.classification = classification;
    return p;
  }, [classification]);

  const { data: topology, isLoading } = useTopology(params);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!topology) return;

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
        coffret_name: eq.coffret?.name || null,
        equipement_code: eq.equipement_code,
      },
    }));

    const rawEdges: Edge[] = topology.edges.map((l: any) => ({
      id: `e${l.id}`,
      source: String(l.from),
      target: String(l.to),
      label: l.label || '',
      animated: l.status === true || l.status === 1,
      style: { stroke: '#94a3b8', cursor: 'pointer' },
      data: {
        media: l.media || '—',
        length: l.length || '—',
        status: l.status === true || l.status === 1,
      },
    }));

    const layouted = layoutGraph(rawNodes, rawEdges);
    setNodes(layouted);
    setEdges(rawEdges);
  }, [topology]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    const d = node.data as any;
    setSelectedNode({
      id: node.id,
      label: d.label,
      type: d.type,
      classification: d.classification,
      status: d.status,
      ip_address: d.ip_address,
      coffret_name: d.coffret_name,
      equipement_code: d.equipement_code,
    });
    setEdgeTooltip(null);
  }, []);

  const onEdgeMouseEnter: EdgeMouseHandler = useCallback((_event, edge) => {
    const d = edge.data as any;
    const rect = (_event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
    if (!rect) return;
    setEdgeTooltip({
      x: _event.clientX - rect.left,
      y: _event.clientY - rect.top - 10,
      label: (edge.label as string) || '—',
      media: d?.media || '—',
      length: d?.length ? `${d.length} m` : '—',
      status: d?.status ?? false,
    });
  }, []);

  const onEdgeMouseLeave = useCallback(() => {
    setEdgeTooltip(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setEdgeTooltip(null);
  }, []);

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
        Aucun équipement à afficher dans la topologie.
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

      <div className="flex gap-3">
        {/* Graph */}
        <div className="rounded-lg border overflow-hidden relative flex-1" style={{ height: 600 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onEdgeMouseEnter={onEdgeMouseEnter}
            onEdgeMouseLeave={onEdgeMouseLeave}
            onPaneClick={onPaneClick}
            fitView
            minZoom={0.2}
            maxZoom={2}
            nodesDraggable
            panOnDrag
            zoomOnScroll
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>

          {/* Edge tooltip */}
          {edgeTooltip && (
            <div
              className="absolute z-50 pointer-events-none bg-popover border rounded-lg shadow-lg px-3 py-2 text-xs space-y-1"
              style={{ left: edgeTooltip.x, top: edgeTooltip.y, transform: 'translate(-50%, -100%)' }}
            >
              <div className="font-medium">{edgeTooltip.label}</div>
              <div className="text-muted-foreground">Média : {edgeTooltip.media}</div>
              <div className="text-muted-foreground">Longueur : {edgeTooltip.length}</div>
              <div className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${edgeTooltip.status ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-muted-foreground">{edgeTooltip.status ? 'Actif' : 'Inactif'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedNode && (
          <div className="w-72 shrink-0 border rounded-lg bg-card p-4 space-y-4 overflow-y-auto" style={{ height: 600 }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Détails</h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedNode(null)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Nom</div>
                <div className="text-sm font-medium">{selectedNode.label}</div>
              </div>

              {selectedNode.equipement_code && (
                <div>
                  <div className="text-xs text-muted-foreground">Code</div>
                  <div className="text-sm font-mono">{selectedNode.equipement_code}</div>
                </div>
              )}

              <div>
                <div className="text-xs text-muted-foreground">Type</div>
                <div className="text-sm">{selectedNode.type || '—'}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Adresse IP</div>
                <div className="text-sm font-mono flex items-center gap-1.5">
                  <Wifi className="h-3 w-3 text-muted-foreground" />
                  {selectedNode.ip_address || '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Classification</div>
                <Badge variant="outline" className="mt-0.5">
                  {selectedNode.classification || '—'}
                </Badge>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Statut</div>
                <Badge
                  variant={selectedNode.status === 'active' ? 'default' : 'secondary'}
                  className="mt-0.5"
                >
                  {statusLabels[selectedNode.status] || selectedNode.status}
                </Badge>
              </div>

              {selectedNode.coffret_name && (
                <div>
                  <div className="text-xs text-muted-foreground">Armoire</div>
                  <div className="text-sm flex items-center gap-1.5">
                    <Server className="h-3 w-3 text-muted-foreground" />
                    {selectedNode.coffret_name}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
