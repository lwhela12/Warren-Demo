import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { colors } from '../theme';

interface Question {
  id: string;
  text: string;
}

interface Survey {
  id: string;
  objective: string;
  questions: Question[];
}

export default function StudentPlaceholder() {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [review, setReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("userRole");
    window.location.reload();
  };

  useEffect(() => {
    fetch(`${API_URL}/api/survey/active`)
      .then((res) => res.json())
      .then((data) => {
        setSurvey(data.survey);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  if (!survey) {
    return (
      <div className="survey-layout">
        <button
          onClick={handleLogout}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            color: colors.primaryDarkBlue || 'blue',
            cursor: "pointer",
          }}
        >
          Logout
        </button>
        <div className="survey-card">
          <h1 style={{ marginTop: 0, color: colors.primaryText, textAlign: 'center' }}>No surveys today!</h1>
        </div>
      </div>
    );
  }

  const questions = survey.questions;
  const current = questions[index];

  if (submitted) {
    return (
      <div className="survey-layout">
        <button
          onClick={handleLogout}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            color: colors.primaryDarkBlue || 'blue',
            cursor: "pointer",
          }}
        >
          Logout
        </button>
        <div className="survey-card">
          <h1 style={{ marginTop: 0, color: colors.primaryText }}>Thanks for submitting!</h1>
          <button
            className="survey-button-primary"
            type="button"
            onClick={async () => {
              await fetch(`${API_URL}/api/survey/${survey.id}/seed`, { method: 'POST' });
              await fetch(`${API_URL}/api/survey/${survey.id}/analyze`, { method: 'POST' });
              alert('Survey seeded and analyzed');
            }}
          >
            Seed the Survey
          </button>
        </div>
      </div>
    );
  }

  if (review) {
    return (
      <div className="survey-layout">
        <button
          onClick={handleLogout}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            color: colors.primaryDarkBlue || 'blue',
            cursor: "pointer",
          }}
        >
          Logout
        </button>
        <div className="survey-header">
          <div style={{ fontWeight: 600, color: colors.primaryText, textAlign: 'center', width: '100%' }}>Review Answers</div>
        </div>
        <div className="survey-card">
          <ul style={{ listStyle: "none", padding: 0 }}>
            {questions.map((q) => (
              <li key={q.id} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: colors.primaryText }}>{q.text}</div>
                <div style={{ border: `1px solid ${colors.border}`, padding: '0.5rem', borderRadius: 4 }}>
                  {answers[q.id] || ''}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="survey-actions">
          <button
            className="survey-button-secondary"
            type="button"
            onClick={() => setReview(false)}
          >
            Back
          </button>
          <button
            className="survey-button-primary"
            type="button"
            onClick={async () => {
              await fetch(`${API_URL}/api/responses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  responses: questions.map((q) => ({
                    questionId: q.id,
                    answer: answers[q.id] || ''
                  }))
                })
              });
              setSubmitted(true);
            }}
          >
            Submit Survey
          </button>
        </div>
      </div>
    );
  }

  const progress = questions.length > 0 ? ((index) / questions.length) * 100 : 0;

  return (
    <div className="survey-layout">
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          background: "none",
          border: "none",
          color: colors.primaryDarkBlue || 'blue',
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      <div className="survey-header">
        <div style={{ fontWeight: 600, color: colors.primaryText, textAlign: 'center', width: '100%' }}>Student Survey</div>
      </div>

      <div className="survey-card">
        <div style={{ fontWeight: 600, marginBottom: 12, color: colors.primaryText, textAlign: 'center' }}>{current?.text || 'Loading question...'}</div>

        {questions.length > 0 && current && (
          <div style={{ width: '100%', marginTop: 8, marginBottom: 16 }}>
            <div className="survey-progress" style={{ marginBottom: 4 }}>
              <div
                className="survey-progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div style={{ fontSize: 12, color: colors.secondaryText, textAlign: 'center' }}>{`Question ${index + 1} of ${questions.length}`}</div>
          </div>
        )}

        <textarea
          value={answers[current?.id || ''] || ''}
          onChange={(e) =>
            current && setAnswers({ ...answers, [current.id]: e.target.value })
          }
          style={{ width: '100%', minHeight: 80 }}
          disabled={!current}
        />
      </div>

      <div className="survey-actions">
        {index > 0 && (
          <button
            className="survey-button-secondary"
            type="button"
            onClick={() => setIndex(index - 1)}
          >
            Previous
          </button>
        )}
        <button
          className="survey-button-primary"
          type="button"
          onClick={() => {
            if (index === questions.length - 1) {
              setReview(true);
            } else {
              setIndex(index + 1);
            }
          }}
        >
          {index === questions.length - 1 ? 'Review' : 'Next'}
        </button>
      </div>
    </div>
  );
}
