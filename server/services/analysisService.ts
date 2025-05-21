import { prisma } from '../db/client';
import { getSurveyAnalysisFromClaude } from './claudeService';

export async function formatSurveyForAnalysis(surveyId: string): Promise<string> {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { questions: { include: { responses: true } } }
  });
  if (!survey) throw new Error(`Survey ${surveyId} not found`);

  let content = `Survey Objective: ${survey.objective}\n\n`;
  survey.questions.forEach((q, idx) => {
    content += `Question ${idx + 1}: ${q.text}\n`;
    content += `Student Responses to Question ${idx + 1}:\n[\n`;
    q.responses.forEach((r, i) => {
      const answer = r.answer.replace(/"/g, '\\"');
      content += `  "${answer}"${i < q.responses.length - 1 ? ',' : ''}\n`;
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
  return getSurveyAnalysisFromClaude(prompt);
}
