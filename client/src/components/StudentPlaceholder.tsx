import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { colors } from '../theme';
import { BranchNode } from './BranchingGraphView';

interface Props {
  surveyId?: string;
}

export default function StudentPlaceholder({ surveyId: propId }: Props) {
  const [surveyId, setSurveyId] = useState<string | null>(propId || null);
  const [node, setNode] = useState<BranchNode | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userRole');
    window.location.reload();
  };

  useEffect(() => {
    async function init() {
      try {
        let id = propId;
        if (!id) {
          const res = await fetch(`${API_URL}/api/survey/active`);
          if (!res.ok) throw new Error('No active survey');
          const data = await res.json();
          id = data.survey?.id;
        }
        if (!id) throw new Error('Survey not found');
        setSurveyId(id);
        const startRes = await fetch(`${API_URL}/api/survey/branching/${id}/start`);
        if (!startRes.ok) throw new Error('Failed to load survey');
        const startData = await startRes.json();
        setNode(startData.node);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [propId]);

  const submitResponses = async (finalAnswers: Record<string, string>) => {
    try {
      await fetch(`${API_URL}/api/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: Object.entries(finalAnswers).map(([nid, answer]) => ({ nodeId: nid, answer }))
        })
      });
    } catch (err) {
      console.error('Failed submitting responses', err);
    }
  };

  const handleNext = async (answer: string) => {
    if (!surveyId || !node) return;
    const newAnswers = { ...answers, [node.id]: answer };
    setAnswers(newAnswers);
    const res = await fetch(`${API_URL}/api/survey/branching/${surveyId}/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentNodeId: node.id, answer })
    });
    if (!res.ok) {
      setFinished(true);
      await submitResponses(newAnswers);
      return;
    }
    const data = await res.json();
    if (!data.node) {
      setFinished(true);
      await submitResponses(newAnswers);
      return;
    }
    setNode(data.node);
    if (data.node.type === 'message' && !data.node.content.options?.length) {
      setFinished(true);
      await submitResponses(newAnswers);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!node) return <div style={{ padding: '2rem' }}>No survey available.</div>;
  if (finished) return (
    <div className="survey-layout">
      <button onClick={handleLogout} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: colors.primaryDarkBlue, cursor: 'pointer' }}>Logout</button>
      <div className="survey-card">
        <h1 style={{ marginTop: 0, textAlign: 'center', color: colors.primaryText }}>Thank you!</h1>
      </div>
    </div>
  );

  return (
    <div className="survey-layout">
      <button onClick={handleLogout} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: colors.primaryDarkBlue, cursor: 'pointer' }}>Logout</button>
      <div className="survey-card">
        <div style={{ fontWeight: 600, marginBottom: 12, color: colors.primaryText, textAlign: 'center' }}>{node.content.text}</div>
        {node.type === 'question-multiple-choice' ? (
          <div>
            {node.content.options?.map((opt) => (
              <button key={opt} className="survey-button-primary" style={{ display: 'block', marginBottom: 8 }} onClick={() => handleNext(opt)}>
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <button className="survey-button-primary" onClick={() => handleNext('')}>Continue</button>
        )}
      </div>
    </div>
  );
}
