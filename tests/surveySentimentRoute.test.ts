import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/index';
import { prisma } from '../server/db/client';
import { createWithQuestions } from '../server/services/surveyService';

beforeAll(async () => {
  await prisma.response.deleteMany();
  await prisma.question.deleteMany();
  await prisma.survey.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/survey/:id/sentiment', () => {
  it('returns sentiment scores for questions', async () => {
    const survey = await createWithQuestions('Obj', [{ text: 'Q1' }]);
    await prisma.response.create({
      data: { questionId: survey.questions[0].id, answer: 'great' }
    });
    const res = await request(app).get(`/api/survey/${survey.id}/sentiment`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions[0]).toHaveProperty('sentimentScore');
  });
});
