import React, { useState } from 'react';
import { colors } from '../theme';

export interface BranchNode {
  id: string;
  type: string;
  content: { text: string; options?: string[] };
}

export interface BranchEdge {
  source: string;
  target: string;
  conditionValue?: string;
}

interface Props {
  surveyId: string;
  nodes: BranchNode[];
  edges: BranchEdge[];
  onSave: (nodes: BranchNode[], edges: BranchEdge[]) => Promise<void> | void;
}

export default function BranchingGraphView({ surveyId, nodes, edges, onSave }: Props) {
  const [localNodes, setLocalNodes] = useState<BranchNode[]>(nodes);
  const [saving, setSaving] = useState(false);

  const handleTextChange = (id: string, text: string) => {
    setLocalNodes((prev) => prev.map((n) => (n.id === id ? { ...n, content: { ...n.content, text } } : n)));
  };

  const handleOptionsChange = (id: string, options: string) => {
    const opts = options.split(',').map((o) => o.trim()).filter(Boolean);
    setLocalNodes((prev) => prev.map((n) => (n.id === id ? { ...n, content: { ...n.content, options: opts } } : n)));
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave(localNodes, edges);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: colors.primaryDarkBlue }}>Branching Survey</h2>
      <div>
        {localNodes.map((node) => (
          <div key={node.id} style={{ marginBottom: '1rem', padding: '1rem', border: `1px solid ${colors.border}`, borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{node.id}</div>
            <textarea
              value={node.content.text}
              onChange={(e) => handleTextChange(node.id, e.target.value)}
              rows={2}
              style={{ width: '100%', marginBottom: 6 }}
            />
            {node.type === 'question-multiple-choice' && (
              <input
                type="text"
                value={node.content.options?.join(', ') || ''}
                onChange={(e) => handleOptionsChange(node.id, e.target.value)}
                placeholder="Options comma separated"
                style={{ width: '100%' }}
              />
            )}
          </div>
        ))}
      </div>
      <button className="login-button" onClick={save} disabled={saving} style={{ marginTop: '1rem' }}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
