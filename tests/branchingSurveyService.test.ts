import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createBranchingSurvey, getEntryNode } from '../server/services/branchingSurveyService';
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

describe('branching survey services', () => {
  it('creates a survey and fetches entry node', async () => {
    const graph = {
      nodes: [
        { id: 'entry', type: 'message', content: { text: 'start' } },
        { id: 'q1', type: 'question-multiple-choice', content: { text: 'Q1', options: ['a','b'] } }
      ],
      edges: [
        { source: 'entry', target: 'q1' }
      ]
    };

    const survey = await createBranchingSurvey('obj', graph);
    expect(survey.nodes.length).toBe(2);
    const entry = await getEntryNode(survey.id);
    expect(entry?.id).toBe('entry');
  });
});
