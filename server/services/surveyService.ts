import { prisma } from '../db/client';
import { Survey, Question } from '@prisma/client';

export interface QuestionInput {
  text: string;
}

export async function createWithQuestions(
  objective: string,
  questions: QuestionInput[]
): Promise<Survey & { questions: Question[] | null }> {
  const result = await prisma.survey.create({
    data: {
      objective,
      questions: {
        create: questions.map((q) => ({ text: q.text }))
      }
    },
    include: { questions: true }
  });
  return result as Survey & { questions: Question[] | null };
}

export async function updateQuestionText(
  questionId: string,
  text: string
): Promise<Question> {
  return prisma.question.update({
    where: { id: questionId },
    data: { text }
  });
}

export async function deploySurvey(id: string): Promise<Survey> {
  return prisma.survey.update({
    where: { id },
    data: { deployedAt: new Date() }
  });
}

export async function getActiveSurvey(): Promise<(Survey & { questions: Question[] | null }) | null> {
  const survey = await prisma.survey.findFirst({
    where: { deployedAt: { not: null } },
    orderBy: { deployedAt: 'desc' },
    include: { questions: true }
  });

  if (!survey) {
    return null;
  }
  return survey as Survey & { questions: Question[] | null };
}

export async function storeSurveyAnalysis(surveyId: string, analysisText: string): Promise<Survey> {
  return prisma.survey.update({
    where: { id: surveyId },
    data: { analysisResultText: analysisText }
  });
}

export async function getSurveyAnalysis(surveyId: string): Promise<string | null> {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: { analysisResultText: true }
  });
  return survey?.analysisResultText || null;
}
