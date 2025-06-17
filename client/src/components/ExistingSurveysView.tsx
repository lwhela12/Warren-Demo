import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';

interface Props {
  onSelectSurvey: (id: string) => void;
}

interface SurveySummary {
  id: string;
  objective: string;
  createdAt: string;
}

export default function ExistingSurveysView({ onSelectSurvey }: Props) {
  const [surveys, setSurveys] = useState<SurveySummary[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/survey`)
      .then(res => res.json())
      .then(data => setSurveys(data.surveys || []))
      .catch(err => console.error('Failed to fetch surveys', err));
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2 className="dashboard-hero" style={{ marginBottom: '24px' }}>Existing Surveys</h2>
      {surveys.map(s => (
        <div
          key={s.id}
          className="action-card"
          onClick={() => onSelectSurvey(s.id)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && onSelectSurvey(s.id)}
          style={{ marginBottom: '1rem', cursor: 'pointer' }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0' }}>{s.objective}</h3>
          <p style={{ margin: 0, fontSize: '0.9em' }}>
            Created: {new Date(s.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
