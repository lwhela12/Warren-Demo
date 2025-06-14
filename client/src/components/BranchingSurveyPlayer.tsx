import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';

interface NodeData {
  id: string;
  type: string;
  content: { text: string; options?: string[] };
}

export default function BranchingSurveyPlayer({ surveyId }: { surveyId: string }) {
  const [node, setNode] = useState<NodeData | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/survey/branching/${surveyId}/start`)
      .then((r) => r.json())
      .then((d) => setNode(d.node));
  }, [surveyId]);

  async function handleSubmit(answer: string) {
    const res = await fetch(`${API_URL}/survey/branching/${surveyId}/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentNodeId: node?.id, answer })
    });
    const data = await res.json();
    setNode(data.node);
  }

  if (!node) return <div>Loading...</div>;

  if (node.type === 'message') {
    return (
      <div>
        <p>{node.content.text}</p>
        <button onClick={() => handleSubmit('')}>Continue</button>
      </div>
    );
  }

  return (
    <div>
      <p>{node.content.text}</p>
      {node.content.options?.map((o) => (
        <button key={o} onClick={() => handleSubmit(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}
