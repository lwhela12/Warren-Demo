import { Router } from 'express';
import { generateQuestions } from '../services/claudeService';

const router = Router();

/**
 * POST /api/claude
 * Body: { objective: string }
 * Response: { questions: Array<{ text: string; rubric: string[] }> }
 */
router.post('/', async (req, res) => {
  const { objective } = req.body;
  if (!objective || typeof objective !== 'string') {
    return res.status(400).json({ error: 'Objective is required' });
  }
  try {
    const questions = await generateQuestions(objective);
    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

export default router;