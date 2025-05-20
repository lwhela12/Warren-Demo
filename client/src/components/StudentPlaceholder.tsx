import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';

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
      <div style={{ padding: '2rem' }}>
        <h1>No surveys today!</h1>
      </div>
    );
  }

  const questions = survey.questions;
  const current = questions[index];

  if (submitted) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Thanks for submitting!</h1>
      </div>
    );
  }

  if (review) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Review Answers</h2>
        <ul>
          {questions.map((q) => (
            <li key={q.id} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>{q.text}</div>
              <div>{answers[q.id] || ''}</div>
            </li>
          ))}
        </ul>
        <button
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
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{current.text}</h2>
      <textarea
        value={answers[current.id] || ''}
        onChange={(e) =>
          setAnswers({ ...answers, [current.id]: e.target.value })
        }
        style={{ width: '100%', minHeight: 80 }}
      />
      <button
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
  );
}
