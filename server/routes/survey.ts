import { Router } from 'express';
import { createWithQuestions, updateQuestionText } from '../services/surveyService';

const router = Router();

router.post('/', async (req, res) => {
  const { objective, questions } = req.body;
  if (!objective || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Objective and questions are required' });
  }
  try {
    const survey = await createWithQuestions(objective, questions);
    res.json({ survey });
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ error: 'Failed to create survey' });
  }
});

router.patch('/:id/question/:qid', async (req, res) => {
  const { qid } = req.params;
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' });
  }
  try {
    const question = await updateQuestionText(qid, text);
    res.json({ question });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

export default router;
