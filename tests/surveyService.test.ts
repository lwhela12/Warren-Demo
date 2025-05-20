import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createWithQuestions,
  deploySurvey,
  getActiveSurvey
} from '../server/services/surveyService';
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

describe('deploySurvey/getActiveSurvey', () => {
  it('marks survey deployed and fetches it as active', async () => {
    const survey = await createWithQuestions('Obj', [{ text: 'Q1' }]);
    await deploySurvey(survey.id);
    const active = await getActiveSurvey();
    expect(active?.id).toBe(survey.id);
    expect(active?.deployedAt).not.toBeNull();
  });
});
