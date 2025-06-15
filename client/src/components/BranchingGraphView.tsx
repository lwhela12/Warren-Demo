import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { colors } from '../theme';

// Node data passed into the custom node component
interface NodeData {
  label: string;
  type: string;
  options?: string[];
  onTextChange: (id: string, text: string) => void;
  onOptionsChange: (id: string, options: string) => void;
}

// Custom renderer for message/question nodes
const CustomNode = ({ id, data }: NodeProps<NodeData>) => (
  <div style={{ padding: 15, border: '1px solid #ddd', borderRadius: 8, background: 'white', width: 250 }}>
    <Handle type="target" position={Position.Top} />
    <div style={{ fontWeight: 'bold', marginBottom: 10, color: colors.primaryText }}>
      {data.type === 'message' ? 'Message' : 'Question'}
    </div>
    <textarea
      value={data.label}
      onChange={(e) => data.onTextChange(id, e.target.value)}
      style={{ width: '100%', boxSizing: 'border-box', marginBottom: 10 }}
      rows={3}
    />
    {data.type === 'question-multiple-choice' && (
      <textarea
        placeholder="Options (comma-separated)"
        value={data.options?.join(', ') || ''}
        onChange={(e) => data.onOptionsChange(id, e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box' }}
        rows={2}
      />
    )}
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export interface BranchNode {
  id: string;
  type: string;
  content: { text: string; options?: string[] };
}

export interface BranchEdge {
  sourceNodeId: string;
  targetNodeId: string;
  conditionValue?: string;
}

interface Props {
  surveyId: string;
  nodes: BranchNode[];
  edges: BranchEdge[];
  onSave: (nodes: BranchNode[], edges: BranchEdge[]) => Promise<void> | void;
}

export default function BranchingGraphView({
  surveyId,
  nodes: initialNodes,
  edges: initialEdges,
  onSave
}: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saving, setSaving] = useState(false);

  const handleTextChange = (id: string, text: string) =>
    setNodes((nds) =>
      nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, label: text } } : node))
    );

  const handleOptionsChange = (id: string, options: string) =>
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, options: options.split(',').map((o) => o.trim()) } }
          : node
      )
    );

  // Register custom node type
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // Initialize nodes and edges when props change
  useEffect(() => {
    const formattedNodes = initialNodes.map((n, idx) => ({
      id: n.id,
      type: 'custom',
      position: { x: 250, y: idx * 200 },
      data: {
        label: n.content.text,
        type: n.type,
        options: n.content.options,
        onTextChange: handleTextChange,
        onOptionsChange: handleOptionsChange
      }
    }));

    const formattedEdges = initialEdges.map((e) => ({
      id: `e-${e.sourceNodeId}-${e.targetNodeId}-${e.conditionValue || ''}`,
      source: e.sourceNodeId,
      target: e.targetNodeId,
      label: e.conditionValue,
      type: 'smoothstep',
      markerEnd: { type: 'arrowclosed' }
    }));

    setNodes(formattedNodes);
    setEdges(formattedEdges);
  }, [initialNodes, initialEdges, setEdges, setNodes]);

  const save = async () => {
    setSaving(true);
    try {
      const updatedNodes = nodes.map((n) => ({
        id: n.id,
        type: n.data.type,
        content: { text: n.data.label, options: n.data.options }
      }));
      await onSave(updatedNodes, initialEdges);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1 }}>
        <h2 style={{ color: colors.primaryDarkBlue }}>Survey Flow</h2>
        <div style={{ height: '70vh', width: '100%', border: `1px solid ${colors.border}`, borderRadius: 8 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            <MiniMap />
            <Background gap={16} />
          </ReactFlow>
        </div>
        <button
          className="login-button"
          onClick={save}
          disabled={saving}
          style={{ marginTop: '1rem' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
