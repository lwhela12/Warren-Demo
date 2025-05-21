import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { seedResponsesForSurvey } from '../server/services/responseService';
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

describe('seedResponsesForSurvey', () => {
  it('creates responses for each question', async () => {
    const survey = await createWithQuestions('Obj', [{ text: 'Q1' }, { text: 'Q2' }]);
    const created = await seedResponsesForSurvey(survey.id, 5);
    expect(created).toBe(10);
    const count = await prisma.response.count({ where: { question: { surveyId: survey.id } } });
    expect(count).toBe(10);
  });
});
