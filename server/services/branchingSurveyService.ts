import { prisma } from '../prisma/client';
import { Node, Edge } from '@prisma/client';

export interface BranchingGraph {
  nodes: Array<{ id: string; type: string; content: any }>;
  edges: Array<{ source: string; target: string; conditionValue?: string }>;
}

export async function createBranchingSurvey(
  surveyId: string,
  graph: BranchingGraph
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const nodes = await prisma.node.createMany({
    data: graph.nodes.map((n) => ({
      id: n.id,
      surveyId,
      type: n.type,
      content: n.content
    }))
  });

  const edges = await prisma.edge.createMany({
    data: graph.edges.map((e) => ({
      surveyId,
      sourceNodeId: e.source,
      targetNodeId: e.target,
      conditionValue: e.conditionValue || null
    }))
  });

  const createdNodes = await prisma.node.findMany({ where: { surveyId } });
  const createdEdges = await prisma.edge.findMany({ where: { surveyId } });

  return { nodes: createdNodes, edges: createdEdges };
}

export async function updateBranchingSurvey(
  surveyId: string,
  graph: BranchingGraph
): Promise<void> {
  await prisma.edge.deleteMany({ where: { surveyId } });
  await prisma.node.deleteMany({ where: { surveyId } });
  await createBranchingSurvey(surveyId, graph);
}

export async function getEntryNode(
  surveyId: string
): Promise<Node | null> {
  return prisma.node.findFirst({ where: { id: 'entry', surveyId } });
}

export async function getNextNode(
  surveyId: string,
  currentNodeId: string,
  answer: string
): Promise<Node | null> {
  const edges = await prisma.edge.findMany({
    where: { surveyId, sourceNodeId: currentNodeId },
    orderBy: { id: 'asc' }
  });
  const match = edges.find((e) => !e.conditionValue || e.conditionValue === answer);
  if (!match) return null;
  return prisma.node.findFirst({ where: { id: match.targetNodeId, surveyId } });
}
