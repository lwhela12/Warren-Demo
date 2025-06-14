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
  const { nodes, edges } = await generateBranchingSurvey(objective);

  const survey = await prisma.survey.create({ data: { objective } });
  await createBranchingSurvey(survey.id, { nodes, edges });

  res.json({ surveyId: survey.id, nodes, edges });
});

router.put('/:id', async (req, res) => {
  const graph = req.body;
  await updateBranchingSurvey(req.params.id, graph);
  res.json({ message: 'updated' });
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
