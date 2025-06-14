import { prisma } from '../prisma/client';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();

export async function calculateSentiment(questionId: string): Promise<number> {
  const responses = await prisma.response.findMany({
    where: { questionId },
    select: { answer: true }
  });
  if (responses.length === 0) return 0;
  const scores = responses.map((r) => sentiment.analyze(r.answer).score);
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return avg;
}
