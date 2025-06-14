import { prisma } from '../prisma/client';

export interface ResponseInput {
  questionId: string;
  answer: string;
}

export async function saveResponses(responses: ResponseInput[]): Promise<void> {
  if (responses.length === 0) return;
  await prisma.response.createMany({ data: responses });
}

import { generateBulkStudentAnswers } from './claudeService';

export async function seedResponsesForSurvey(surveyId: string, count = 30): Promise<number> {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { questions: true }
  });
  if (!survey || !survey.questions.length) {
    throw new Error('Survey not found or has no questions');
  }

  const responses: ResponseInput[] = [];
  for (const q of survey.questions) {
    const answers = await generateBulkStudentAnswers(q.text, count);
    for (let i = 0; i < count; i++) {
      responses.push({ questionId: q.id, answer: answers[i] || '' });
    }
  }
  if (responses.length) {
    await prisma.response.createMany({ data: responses });
  }
  return responses.length;
}
