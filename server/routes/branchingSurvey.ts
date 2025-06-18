import { Router } from 'express';
import {
  createBranchingSurvey,
  updateBranchingSurvey,
  getEntryNode,
  getNextNode
} from '../services/branchingSurveyService';
import { generateBranchingSurvey } from '../services/claudeService';
import { prisma } from '../prisma/client';

const router = Router();

router.post('/', async (req, res) => {
  const { objective } = req.body;
  if (!objective) return res.status(400).json({ error: 'objective required' });
  const graph = await generateBranchingSurvey(objective);
  const survey = await prisma.survey.create({ data: { objective } });
  const { nodes, edges } = await createBranchingSurvey(survey.id, graph);
  res.json({ surveyId: survey.id, nodes, edges });
});

router.put('/:id', async (req, res) => {
  const graph = req.body;
  await updateBranchingSurvey(req.params.id, graph);
  res.json({ message: 'updated' });
});

// New route to fetch a survey along with its nodes and edges
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        nodes: true,
        edges: true
      }
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const normalizedEdges = survey.edges.map((e) => ({
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
      conditionValue: e.conditionValue || undefined
    }));

    res.json({
      surveyId: survey.id,
      objective: survey.objective,
      nodes: survey.nodes,
      edges: normalizedEdges
    });
  } catch (error) {
    console.error(`Error fetching branching survey ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch survey graph' });
  }
});

router.get('/:id/start', async (req, res) => {
  const node = await getEntryNode(req.params.id);
  if (!node) return res.status(404).json({ error: 'entry node not found' });
  res.json({ node });
});

router.post('/:id/next', async (req, res) => {
  const { currentNodeId, answer } = req.body;
  if (!currentNodeId) return res.status(400).json({ error: 'currentNodeId required' });
  const node = await getNextNode(req.params.id, currentNodeId, answer);
  if (!node) return res.status(404).json({ error: 'next node not found' });
  res.json({ node });
});

export default router;
