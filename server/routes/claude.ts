import { Router } from 'express';
import { generateQuestions, regenerateQuestion } from '../services/claudeService';

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

/**
 * POST /api/claude/regenerate
 * Body: { objective: string, feedback: string }
 * Response: { question: { text: string; rubric: string[] } }
 */
router.post('/regenerate', async (req, res) => {
  const { objective, feedback } = req.body;
  if (!objective || typeof objective !== 'string') {
    return res.status(400).json({ error: 'Objective is required' });
  }
  if (!feedback || typeof feedback !== 'string') {
    return res.status(400).json({ error: 'Feedback is required' });
  }
  try {
    const question = await regenerateQuestion(objective, feedback);
    res.json({ question });
  } catch (error) {
    console.error('Error regenerating question:', error);
    res.status(500).json({ error: 'Failed to regenerate question' });
  }
});

export default router;