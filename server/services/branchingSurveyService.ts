import { prisma } from '../prisma/client';
import { BranchingSurvey } from './claudeService';

export interface NodeInput {
  id: string;
  type: string;
  content: any;
}

export interface EdgeInput {
  source: string;
  target: string;
  conditionValue?: string;
}

export async function createBranchingSurvey(
  objective: string,
  graph: BranchingSurvey
) {
  const survey = await prisma.survey.create({ data: { objective } });

  await prisma.node.createMany({
    data: graph.nodes.map((n: NodeInput) => ({
      id: n.id,
      surveyId: survey.id,
      type: n.type,
      content: n.content
    }))
  });

  await prisma.edge.createMany({
    data: graph.edges.map((e: EdgeInput) => ({
      surveyId: survey.id,
      sourceNodeId: e.source,
      targetNodeId: e.target,
      conditionValue: e.conditionValue
    }))
  });

  return prisma.survey.findUnique({
    where: { id: survey.id },
    include: { nodes: true, edges: true }
  });
}

export async function updateBranchingSurvey(
  surveyId: string,
  graph: BranchingSurvey
) {
  await prisma.node.deleteMany({ where: { surveyId } });
  await prisma.edge.deleteMany({ where: { surveyId } });

  await prisma.node.createMany({
    data: graph.nodes.map((n: NodeInput) => ({
      id: n.id,
      surveyId,
      type: n.type,
      content: n.content
    }))
  });

  await prisma.edge.createMany({
    data: graph.edges.map((e: EdgeInput) => ({
      surveyId,
      sourceNodeId: e.source,
      targetNodeId: e.target,
      conditionValue: e.conditionValue
    }))
  });

  return prisma.survey.findUnique({
    where: { id: surveyId },
    include: { nodes: true, edges: true }
  });
}

export async function getEntryNode(surveyId: string) {
  return prisma.node.findFirst({ where: { surveyId, id: 'entry' } });
}

export async function getNextNode(
  surveyId: string,
  currentNodeId: string,
  answer: string
) {
  const edge = await prisma.edge.findFirst({
    where: {
      surveyId,
      sourceNodeId: currentNodeId,
      OR: [{ conditionValue: answer }, { conditionValue: null }]
    }
  });
  if (!edge) return null;
  return prisma.node.findUnique({ where: { id: edge.targetNodeId } });
}
