import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface QuestionResult {
  nodeId: string;
  text: string;
  aggregation: Record<string, number>;
}

export default function BranchingResultsCharts({ surveyId }: { surveyId: string }) {
  const [data, setData] = useState<QuestionResult[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/survey/branching/${surveyId}/results`)
      .then((res) => res.json())
      .then((d) => setData(d.questions || []))
      .catch(() => setData([]));
  }, [surveyId]);

  if (!data.length) return <div>No results data.</div>;

  return (
    <div>
      {data.map((q) => {
        const labels = Object.keys(q.aggregation);
        const chartData = {
          labels,
          datasets: [
            {
              label: 'Responses',
              data: labels.map((l) => q.aggregation[l] || 0),
              backgroundColor: 'rgba(75,192,192,0.6)'
            }
          ]
        };
        return (
          <div key={q.nodeId} style={{ marginBottom: '2rem' }}>
            <h3>{q.text}</h3>
            <Bar data={chartData} />
          </div>
        );
      })}
    </div>
  );
}
