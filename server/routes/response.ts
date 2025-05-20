import { Router } from 'express';
import { saveResponses } from '../services/responseService';

const router = Router();

router.post('/', async (req, res) => {
  const { responses } = req.body;
  if (!Array.isArray(responses)) {
    return res.status(400).json({ error: 'Responses array is required' });
  }
  try {
    await saveResponses(responses);
    res.json({ message: 'Saved' });
  } catch (error) {
    console.error('Error saving responses:', error);
    res.status(500).json({ error: 'Failed to save responses' });
  }
});

export default router;
