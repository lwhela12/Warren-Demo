import { prisma } from '../prisma/client';
import { getSurveyAnalysisFromClaude } from './claudeService';
import { storeSurveyAnalysis } from './surveyService';
import { calculateSentiment } from './sentimentService';

export async function formatSurveyForAnalysis(surveyId: string): Promise<string> {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { nodes: { include: { responses: true } } }
  });
  if (!survey) throw new Error(`Survey ${surveyId} not found`);

  let content = `Survey Objective: ${survey.objective}\n\n`;
  survey.nodes.forEach((n, idx) => {
    const text = (n.content as any).text || '';
    content += `Question ${idx + 1}: ${text}\n`;
    content += `Student Responses to Question ${idx + 1}:\n[\n`;
    n.responses.forEach((r, i) => {
      const answer = r.answer.replace(/"/g, '\\"');
      content += `  "${answer}"${i < n.responses.length - 1 ? ',' : ''}\n`;
    });
    content += `]\n\n`;
  });
  return content;
}

export async function analyzeSurveyResponses(surveyId: string): Promise<string> {
  const surveyContent = await formatSurveyForAnalysis(surveyId);
  const instructions =
    'You are an expert qualitative data analyst assisting educators. Analyze the following anonymous survey responses. For each question provide themes, overall sentiment, representative quotes, any outliers, and 2-3 key takeaways. After all questions, summarise the entire survey. Return Markdown formatted text.';
  const prompt = `${instructions}\n\n${surveyContent}`;
  const analysisText = await getSurveyAnalysisFromClaude(prompt);
  const survey = await prisma.survey.findUnique({ where: { id: surveyId }, include: { nodes: true } });
  if (survey) {
    for (const n of survey.nodes) {
      const score = await calculateSentiment(n.id);
      await prisma.node.update({ where: { id: n.id }, data: { sentimentScore: score } });
    }
  }
  await storeSurveyAnalysis(surveyId, analysisText);
  return analysisText;
}
