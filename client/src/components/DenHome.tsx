import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { colors } from '../theme';

interface AnalyzedSurvey {
  id: string;
  objective: string;
  createdAt: string;
}

interface DenHomeProps {
  onSelectSurvey: (surveyId: string) => void;
}

export default function DenHome({ onSelectSurvey }: DenHomeProps) {
  const [analyzedSurveys, setAnalyzedSurveys] = useState<AnalyzedSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/survey/analyzed`)
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || 'Failed to fetch analyzed surveys'); });
        }
        return res.json();
      })
      .then(data => {
        setAnalyzedSurveys(data.surveys || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading survey results...</div>;
  }

  if (error) {
    return <div className="error" style={{ padding: '2rem', color: '#d7382a', background: '#fff6f4', borderRadius: 6, fontWeight: 500 }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2 className="dashboard-hero" style={{ marginBottom: '24px' }}>The Den: Survey Results</h2>
      {analyzedSurveys.length === 0 ? (
        <p style={{ textAlign: 'center', color: colors.secondaryText }}>
          No survey results available yet. Please analyze a survey first.
        </p>
      ) : (
        <div>
          {analyzedSurveys.map(survey => (
            <div
              key={survey.id}
              className="action-card"
              onClick={() => onSelectSurvey(survey.id)}
              onKeyPress={(e) => e.key === 'Enter' && onSelectSurvey(survey.id)}
              role="button"
              tabIndex={0}
              style={{ marginBottom: '1rem', cursor: 'pointer' }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', color: colors.primaryDarkBlue }}>{survey.objective}</h3>
              <p style={{ margin: 0, fontSize: '0.9em', color: colors.secondaryText }}>
                Created: {new Date(survey.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}