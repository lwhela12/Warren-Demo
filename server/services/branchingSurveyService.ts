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
      console.warn(
        `Skipping invalid edge linkage: ${e.sourceNodeId} → ${e.targetNodeId}`
      );
      continue;
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
  // Prefer a matching conditional branch first, then fall back to an unconditional default edge
  const match = edges.find((e) => e.conditionValue === answer)
    || edges.find((e) => !e.conditionValue);
  if (!match) return null;
  return prisma.node.findFirst({ where: { id: match.targetNodeId, surveyId } });
}

/** Simulate a single student's path through the survey */
async function simulateStudent(
  surveyId: string,
  entryNode: Node
): Promise<Array<{ nodeId: string; answer: string }>> {
  let currentNode: Node | null = entryNode;
  const responses: { nodeId: string; answer: string }[] = [];

  while (currentNode) {
    if (currentNode.type === 'question-multiple-choice') {
      const options = (currentNode.content as any)?.options as string[] | undefined;
      if (!options || options.length === 0) break;
      const answer = options[Math.floor(Math.random() * options.length)];
      responses.push({ nodeId: currentNode.id, answer });
      currentNode = await getNextNode(surveyId, currentNode.id, answer);
    } else {
      currentNode = await getNextNode(surveyId, currentNode.id, '');
    }
  }

  return responses;
}

/**
 * Seed branching survey responses for a demo by simulating multiple students.
 */
export async function seedBranchingSurveyResponses(
  surveyId: string,
  count = 25
): Promise<number> {
  const entry = await getEntryNode(surveyId);
  if (!entry) throw new Error('Entry node not found');

  let all: { nodeId: string; answer: string }[] = [];
  for (let i = 0; i < count; i++) {
    const student = await simulateStudent(surveyId, entry);
    all.push(...student);
  }

  if (all.length) {
    await prisma.response.createMany({ data: all });
  }
  return all.length;
}

export interface BranchingSurveyResults {
  questions: Array<{
    nodeId: string;
    text: string;
    options: string[];
    aggregation: Record<string, number>;
    rawResponses: Array<{ answer: string }>;
  }>;
}

/**
 * Retrieve aggregated and raw results for a branching survey.
 */
export async function getBranchingSurveyResults(
  surveyId: string
): Promise<BranchingSurveyResults> {
  const nodes = await prisma.node.findMany({
    where: { surveyId, type: 'question-multiple-choice' },
    include: { responses: true }
  });

  const questions = nodes.map((n) => {
    const text = (n.content as any)?.text ?? '';
    const options: string[] = (n.content as any)?.options ?? [];
    const aggregation: Record<string, number> = {};
    options.forEach((o) => {
      aggregation[o] = 0;
    });
    n.responses.forEach((r) => {
      aggregation[r.answer] = (aggregation[r.answer] || 0) + 1;
    });
    return {
      nodeId: n.id,
      text,
      options,
      aggregation,
      rawResponses: n.responses.map((r) => ({ answer: r.answer }))
    };
  });

  return { questions };
}
