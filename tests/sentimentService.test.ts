import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { calculateSentiment } from '../server/services/sentimentService';
import { createWithQuestions } from '../server/services/surveyService';
import { prisma } from '../server/db/client';

beforeAll(async () => {
  await prisma.response.deleteMany();
  await prisma.question.deleteMany();
  await prisma.survey.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('calculateSentiment', () => {
  it('computes average sentiment from responses', async () => {
    const survey = await createWithQuestions('Obj', [{ text: 'Q1' }]);
    await prisma.response.createMany({
      data: [
        { questionId: survey.questions[0].id, answer: 'I love it' },
        { questionId: survey.questions[0].id, answer: 'bad experience' }
      ]
    });
    const score = await calculateSentiment(survey.questions[0].id);
    expect(typeof score).toBe('number');
  });
});
