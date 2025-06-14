import React, { useEffect, useState } from 'react';
import ReactFlow, { Node, Edge } from 'react-flow-renderer';
import { API_URL } from '../config';

interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export default function FlowEditor() {
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/survey/branching`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: 'Demo branching survey' })
      });
      const data = await res.json();
      const nodes = data.survey.nodes.map((n: any) => ({ id: n.id, data: n.content, position: { x: 0, y: 0 } }));
      const edges = data.survey.edges.map((e: any) => ({ id: e.id, source: e.sourceNodeId, target: e.targetNodeId }));
      setGraph({ nodes, edges });
    }
    load();
  }, []);

  return (
    <div style={{ height: 400 }}>
      <ReactFlow nodes={graph.nodes} edges={graph.edges} />
    </div>
  );
}
