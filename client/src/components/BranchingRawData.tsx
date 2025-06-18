import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';

interface RawResponse {
  answer: string;
}
interface QuestionData {
  nodeId: string;
  text: string;
  rawResponses: RawResponse[];
}

export default function BranchingRawData({ surveyId }: { surveyId: string }) {
  const [questions, setQuestions] = useState<QuestionData[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/survey/branching/${surveyId}/results`)
      .then((res) => res.json())
      .then((d) => setQuestions(d.questions || []))
      .catch(() => setQuestions([]));
  }, [surveyId]);

  if (!questions.length) return <div>No results data.</div>;

  return (
    <div>
      {questions.map((q) => (
        <div key={q.nodeId} style={{ marginBottom: '1rem' }}>
          <strong>{q.text}</strong>
          <ul>
            {q.rawResponses.map((r, i) => (
              <li key={i}>{r.answer}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
