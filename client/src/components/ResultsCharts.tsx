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

interface QuestionSentiment {
  id: string;
  text: string;
  sentimentScore: number | null;
}

export default function ResultsCharts({ surveyId }: { surveyId: string }) {
  const [data, setData] = useState<QuestionSentiment[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/survey/${surveyId}/sentiment`)
      .then((res) => res.json())
      .then((d) => setData(d.questions || []))
      .catch(() => setData([]));
  }, [surveyId]);

  if (!data.length) return <div>No sentiment data.</div>;

  const chartData = {
    labels: data.map((q) => q.text),
    datasets: [
      {
        label: 'Sentiment Score',
        data: data.map((q) => q.sentimentScore || 0),
        backgroundColor: 'rgba(75,192,192,0.6)'
      }
    ]
  };

  return <Bar data={chartData} />;
}
