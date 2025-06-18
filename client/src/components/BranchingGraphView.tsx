import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { colors } from '../theme';
import MethodologyModal from './MethodologyModal';
import ChatOverlay from './ChatOverlay';
import { API_URL } from '../config';

// Node data passed into the custom node component
interface NodeData {
  label: string;
  type: string;
  options?: string[];
  rationale?: string;
  onTextChange: (id: string, text: string) => void;
  onOptionsChange: (id: string, options: string) => void;
  onShowRationale: (rationale: string) => void;
}

// Custom renderer for message/question nodes
const CustomNode = ({ id, data }: NodeProps<NodeData>) => (
  <div style={{ position: 'relative', padding: 15, border: '1px solid #ddd', borderRadius: 8, background: 'white', width: 250 }}>
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
    {/* info‑icon */}
    <button
      title="View Rationale"
      onClick={() => data.onShowRationale(data.rationale ?? 'No rationale available.')}
      style={{
        position: 'absolute',
        top: 6,
        right: 6,
        border: 'none',
        background: 'none',
        color: colors.primaryDarkBlue,
        fontSize: 16,
        cursor: 'pointer'
      }}
    >
      ⓘ
    </button>
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
  const [showRationaleModal, setShowRationaleModal] = useState(false);
  const [rationaleContent, setRationaleContent] = useState('');
  const [showChat, setShowChat] = useState(false);

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

  const handleShowRationale = (rationale: string) => {
    setRationaleContent(rationale);
    setShowRationaleModal(true);
  };

  const handleSeedAndAnalyze = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/survey/branching/${surveyId}/seed-and-analyze`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Failed');
      alert('Survey seeded and analyzed. Check "The Den" for results.');
    } catch (err) {
      console.error(err);
      alert('Error seeding survey');
    }
  };

  // Register custom node type
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // Initialize nodes and edges when props change
  useEffect(() => {
    // Layout: all MC questions in a row; their explanation messages stack below each question
    const nodeMap = Object.fromEntries(initialNodes.map((n) => [n.id, n]));
    const edgesBySource = initialEdges.reduce((map, e) => {
      (map[e.sourceNodeId] ||= []).push(e);
      return map;
    }, {} as Record<string, BranchEdge[]>);

    const questions = initialNodes.filter((n) => n.type === 'question-multiple-choice');
    // Spacing constants for a more spread-out layout
    const questionY = 150;
    const questionXStep = 700;
    const baseX = 100;
    const childXOffset = 350;   // horizontal offset for explanation nodes
    const childYStep = 240;     // vertical spacing between explanation nodes

    // Build row of questions flanked by entry and thank_you, with explanations stacked to the right
    const formattedNodes: any[] = [];

    // Entry node (far left)
    if (nodeMap['entry']) {
      formattedNodes.push({
        id: 'entry',
        type: 'custom',
        position: { x: baseX, y: questionY },
        data: {
          label: nodeMap['entry'].content.text,
          type: 'message',
          options: [],
          rationale: (nodeMap['entry'].content as any).rationale,
          onTextChange: handleTextChange,
          onOptionsChange: handleOptionsChange,
          onShowRationale: handleShowRationale
        }
      });
    }

    questions.forEach((qn, qIdx) => {
      const qx = baseX + qIdx * questionXStep;
      // question node
      formattedNodes.push({
        id: qn.id,
        type: 'custom',
        position: { x: qx, y: questionY },
        data: {
          label: qn.content.text,
          type: qn.type,
          options: qn.content.options,
          rationale: (qn.content as any).rationale,
          onTextChange: handleTextChange,
          onOptionsChange: handleOptionsChange,
          onShowRationale: handleShowRationale
        }
      });
      // stacked explanation nodes to the right
      const children = edgesBySource[qn.id] || [];
      children.forEach((edge, cIdx) => {
        const mn = nodeMap[edge.targetNodeId];
        if (mn) {
          formattedNodes.push({
            id: mn.id,
            type: 'custom',
            position: { x: qx + childXOffset, y: questionY + cIdx * childYStep },
            data: {
              label: mn.content.text,
              type: mn.type,
              options: mn.content.options,
              rationale: (mn.content as any).rationale,
              onTextChange: handleTextChange,
              onOptionsChange: handleOptionsChange,
              onShowRationale: handleShowRationale
            }
          });
        }
      });
    });

    // thank_you node (far right)
    if (nodeMap['thank_you']) {
      formattedNodes.push({
        id: 'thank_you',
        type: 'custom',
        position: { x: baseX + (questions.length + 1) * questionXStep, y: questionY },
        data: {
          label: nodeMap['thank_you'].content.text,
          type: 'message',
          options: [],
          rationale: (nodeMap['thank_you'].content as any).rationale,
          onTextChange: handleTextChange,
          onOptionsChange: handleOptionsChange,
          onShowRationale: handleShowRationale
        }
      });
    }

    const formattedEdges = initialEdges.map((e) => ({
      id: `e-${e.sourceNodeId}-${e.targetNodeId}-${e.conditionValue || ''}`,
      source: e.sourceNodeId,
      target: e.targetNodeId,
      label: e.conditionValue,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed }
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
      // Filter out any edges pointing to nodes that no longer exist
      const validEdges = edges.filter(
        (e) => updatedNodes.some((n) => n.id === e.source) && updatedNodes.some((n) => n.id === e.target)
      );
      if (validEdges.length < edges.length) {
        console.warn('Dropping invalid edges before save');
      }
      await onSave(updatedNodes, validEdges);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
          {nodes.length > 8 && <MiniMap />}
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
        <button
          className="login-button"
          onClick={() => setShowChat(true)}
          style={{ marginTop: '1rem', marginLeft: '1rem' }}
        >
          Demo Survey
        </button>
        <button
          className="login-button"
          onClick={handleSeedAndAnalyze}
          style={{
            marginTop: '1rem',
            marginLeft: '1rem'
          }}
        >
          Seed and Analyze Survey
        </button>
        </div>
      </div>
      <MethodologyModal open={showRationaleModal} onClose={() => setShowRationaleModal(false)}>
        <h2>Question Rationale</h2>
        <p>{rationaleContent}</p>
      </MethodologyModal>
      {showChat && <ChatOverlay surveyId={surveyId} onClose={() => setShowChat(false)} />}
    </>
  );
}
