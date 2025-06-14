import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createWithQuestions,
  deploySurvey,
  getActiveSurvey,
  getAnalyzedSurveys
} from '../server/services/surveyService';
import { prisma } from '../server/prisma/client';

beforeEach(async () => {
  // Clear tables before each test for isolation
  await prisma.response.deleteMany();
  await prisma.question.deleteMany();
  await prisma.survey.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('getAnalyzedSurveys', () => {
  it('returns only surveys that have analysisResultText set', async () => {
    // Clear existing surveys
    await prisma.question.deleteMany();
    await prisma.survey.deleteMany();
    // Create two surveys
    const survey1 = await createWithQuestions('Objective 1', [{ text: 'Q1' }]);
    const survey2 = await createWithQuestions('Objective 2', [{ text: 'Q2' }]);
    // Store analysis only for survey2
    const analysisText = 'Analysis for survey2';
    await prisma.survey.update({
      where: { id: survey2.id },
      data: { analysisResultText: analysisText }
    });
    // Fetch analyzed surveys
    const analyzed = await getAnalyzedSurveys();
    expect(Array.isArray(analyzed)).toBe(true);
    // Should include only survey2
    expect(analyzed.length).toBe(1);
    expect(analyzed[0].id).toBe(survey2.id);
    expect(analyzed[0].objective).toBe('Objective 2');
  });
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
