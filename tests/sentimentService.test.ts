import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { calculateSentiment } from '../server/services/sentimentService';
import { createBranchingSurvey } from '../server/services/branchingSurveyService';
import { prisma } from '../server/prisma/client';

beforeAll(async () => {
  await prisma.response.deleteMany();
  await prisma.node.deleteMany();
  await prisma.edge.deleteMany();
  await prisma.survey.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('calculateSentiment', () => {
  it('computes average sentiment from responses', async () => {
    const graph = {
      nodes: [
        { id: 'entry', type: 'message', content: { text: 'hi' } },
        { id: 'q1', type: 'question-multiple-choice', content: { text: 'Q1' } }
      ],
      edges: [{ source: 'entry', target: 'q1' }]
    };
    const survey = await createBranchingSurvey('Obj', graph);
    await prisma.response.createMany({
      data: [
        { nodeId: 'q1', answer: 'I love it' },
        { nodeId: 'q1', answer: 'bad experience' }
      ]
    });
    const score = await calculateSentiment('q1');
    expect(typeof score).toBe('number');
  });
});
