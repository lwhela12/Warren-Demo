import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';

interface SurveyAnalysis {
  analysis: string;
}

const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

interface ResultsViewProps {
  surveyId: string | null;
  onGoBackToList?: () => void;
}

export default function ResultsView({ surveyId: propSurveyId, onGoBackToList }: ResultsViewProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSurveyId, setCurrentSurveyId] = useState<string | null>(propSurveyId);

  useEffect(() => {
    async function fetchActiveSurvey() {
      try {
        const surveyRes = await fetch(`${API_URL}/api/survey/active`);
        if (!surveyRes.ok) throw new Error('Failed to fetch active survey.');
        const surveyData = await surveyRes.json();
        if (surveyData.survey && surveyData.survey.id) {
          setCurrentSurveyId(surveyData.survey.id);
        } else {
          setError('No active survey found to display results for.');
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Could not fetch active survey.');
        setLoading(false);
      }
    }

    if (!propSurveyId) {
      fetchActiveSurvey();
    } else {
      setCurrentSurveyId(propSurveyId);
    }
  }, [propSurveyId]);

  useEffect(() => {
    if (!currentSurveyId) {
      if (error) setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/survey/${currentSurveyId}/analysisResult`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Analysis not found. It might not be generated yet.');
          throw new Error('Failed to fetch analysis');
        }
        return res.json();
      })
      .then((data: SurveyAnalysis) => {
        setAnalysis(data.analysis);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || 'An unexpected error occurred.');
        setLoading(false);
      });
  }, [currentSurveyId]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading analysis...</div>;
  if (error) return <div className="error" style={{ padding: '2rem' }}>Error: {error}</div>;
  if (!analysis) return <div style={{ padding: '2rem' }}>No analysis available for this survey.</div>;

  return (
    <div className="card" style={{ margin: '2rem', padding: '2rem' }}>
      {/** Back button to list if provided */}
      {typeof onGoBackToList === 'function' && (
        <button
          onClick={onGoBackToList}
          style={{
            marginBottom: '1rem',
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            padding: 0,
            fontSize: '0.9rem'
          }}
        >
          ← Back to Survey List
        </button>
      )}
      <h1 style={{ marginTop: 0 }}>Survey Analysis</h1>
      <SimpleMarkdown content={analysis} />
    </div>
  );
}
