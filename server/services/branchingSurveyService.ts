import { prisma } from '../prisma/client';
import { Node, Edge } from '@prisma/client';

export interface BranchingGraph {
  nodes: Array<{ id: string; type: string; content: any }>;
  // Edges reference node IDs as sourceNodeId/targetNodeId
  edges: Array<{ sourceNodeId: string; targetNodeId: string; conditionValue?: string }>;
}

export async function createBranchingSurvey(
  surveyId: string,
  graph: BranchingGraph
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const idMap: Record<string, string> = {};
  const createdNodes: Node[] = [];
  for (const n of graph.nodes) {
    const node = await prisma.node.create({
      data: {
        surveyId,
        type: n.type,
        content: n.content
      }
    });
    idMap[n.id] = node.id;
    createdNodes.push(node);
  }

  const createdEdges: Edge[] = [];
  for (const e of graph.edges) {
    const src = idMap[e.sourceNodeId];
    const tgt = idMap[e.targetNodeId];
    if (!src || !tgt) {
      throw new Error(
        `Invalid edge linkage: cannot map sourceNodeId '${e.sourceNodeId}' or targetNodeId '${e.targetNodeId}' to created node IDs.`
      );
    }
    const edge = await prisma.edge.create({
      data: {
        surveyId,
        sourceNodeId: src,
        targetNodeId: tgt,
        conditionValue: e.conditionValue || null
      }
    });
    createdEdges.push(edge);
  }

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
  return prisma.node.findFirst({
    where: { surveyId, incomingEdges: { none: {} } }
  });
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
