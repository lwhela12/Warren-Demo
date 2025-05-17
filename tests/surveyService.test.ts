import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createWithQuestions } from '../server/services/surveyService';
import { prisma } from '../server/db/client';

beforeAll(async () => {
  await prisma.survey.deleteMany();
  await prisma.question.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('createWithQuestions', () => {
  it('creates a survey with provided questions', async () => {
    const survey = await createWithQuestions('Test objective', [
      { text: 'Q1' },
      { text: 'Q2' }
    ]);

    expect(survey.id).toBeDefined();
    expect(survey.questions.length).toBe(2);
  });
});
