import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/index';
import { prisma } from '../server/prisma/client';
import { createBranchingSurvey } from '../server/services/branchingSurveyService';

beforeAll(async () => {
  await prisma.response.deleteMany();
  await prisma.node.deleteMany();
  await prisma.edge.deleteMany();
  await prisma.survey.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/survey/:id/sentiment', () => {
  it('returns sentiment scores for nodes', async () => {
    const graph = {
      nodes: [
        { id: 'entry', type: 'message', content: { text: 'hi' } },
        { id: 'q1', type: 'question-multiple-choice', content: { text: 'Q1' } }
      ],
      edges: [{ source: 'entry', target: 'q1' }]
    };
    const survey = await createBranchingSurvey('Obj', graph);
    await prisma.response.create({ data: { nodeId: 'q1', answer: 'great' } });
    const res = await request(app).get(`/api/survey/${survey.id}/sentiment`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions[0]).toHaveProperty('sentimentScore');
  });
});
