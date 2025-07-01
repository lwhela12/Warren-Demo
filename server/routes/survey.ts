import { Router } from 'express';
import {
  createWithQuestions,
  updateQuestionText,
  deploySurvey,
  getActiveSurvey,
  getSurveyAnalysis,
  getAnalyzedSurveys,
  getSurveySentiment
} from '../services/surveyService';
import {
  seedResponsesForSurvey
} from '../services/responseService';
import {
  analyzeSurveyResponses,
  analyzeBranchingSurvey
} from '../services/analysisService';
import { prisma } from '../prisma/client';

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

// Fetch all surveys ordered by creation date (new endpoint)
router.get('/', async (_req, res) => {
  try {
    const surveys = await prisma.survey.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json({ surveys });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
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

router.post('/:id/deploy', async (req, res) => {
  const { id } = req.params;
  try {
    const survey = await deploySurvey(id);
    res.json({ survey });
  } catch (error) {
    console.error('Error deploying survey:', error);
    res.status(500).json({ error: 'Failed to deploy survey' });
  }
});

router.get('/active', async (_req, res) => {
  try {
    const survey = await getActiveSurvey();
    res.json({ survey });
  } catch (error) {
    console.error('Error fetching active survey:', error);
    res.status(500).json({ error: 'Failed to fetch survey' });
  }
});

router.post('/:id/seed', async (req, res) => {
  const { id } = req.params;
  try {
    const created = await seedResponsesForSurvey(id);
    res.json({ created });
  } catch (error) {
    console.error('Error seeding survey:', error);
    res.status(500).json({ error: 'Failed to seed survey' });
  }
});

router.post('/:id/analyze', async (req, res) => {
  const { id } = req.params;
  try {
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: { _count: { select: { nodes: true } } }
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    let analysis: string;
    if (survey._count.nodes > 0) {
      console.log(`Analyzing branching survey ${id}...`);
      analysis = await analyzeBranchingSurvey(id);
    } else {
      console.log(`Analyzing linear survey ${id}...`);
      analysis = await analyzeSurveyResponses(id);
    }

    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing survey:', error);
    res.status(500).json({ error: 'Failed to analyze survey' });
  }
});

// GET /api/survey/analyzed
router.get('/analyzed', async (_req, res) => {
  try {
    const surveys = await getAnalyzedSurveys();
    res.json({ surveys });
  } catch (error) {
    console.error('Error fetching analyzed surveys:', error);
    res.status(500).json({ error: 'Failed to fetch analyzed surveys' });
  }
});

router.get('/:id/analysisResult', async (req, res) => {
  const { id } = req.params;
  try {
    const analysis = await getSurveyAnalysis(id);
    if (analysis) {
      res.json({ analysis });
    } else {
      res.status(404).json({ error: 'Analysis not found or not yet generated for this survey.' });
    }
  } catch (error) {
    console.error('Error fetching survey analysis:', error);
    res.status(500).json({ error: 'Failed to fetch survey analysis' });
  }
});

router.get('/:id/sentiment', async (req, res) => {
  const { id } = req.params;
  try {
    const questions = await getSurveySentiment(id);
    res.json({ questions });
  } catch (error) {
    console.error('Error fetching survey sentiment:', error);
    res.status(500).json({ error: 'Failed to fetch survey sentiment' });
  }
});

export default router;
