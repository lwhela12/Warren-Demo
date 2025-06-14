import { prisma } from '../prisma/client';
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

/**
 * Mark a survey as deployed by setting deployedAt timestamp.
 */
export async function deploySurvey(id: string): Promise<Survey> {
  const survey = await prisma.survey.update({
    where: { id },
    data: { deployedAt: new Date() }
  });
  if (!survey) {
    throw new Error(`Survey with id ${id} not found for deployment.`);
  }
  return survey;
}

/**
 * Fetch the most recently deployed survey (based on deployedAt).
 */
export async function getActiveSurvey(): Promise<(Survey & { questions: Question[] | null }) | null> {
  const survey = await prisma.survey.findFirst({
    where: { deployedAt: { not: null } },
    orderBy: { deployedAt: 'desc' },
    include: { questions: true }
  });
  if (!survey) return null;
  return survey as Survey & { questions: Question[] | null };
}

export async function storeSurveyAnalysis(surveyId: string, analysisText: string): Promise<Survey> {
  // NOTE: This function attempts to update 'analysisResultText' on the Survey model.
  // If 'analysisResultText' is missing from schema.prisma, this update will fail.
  // IDEAL FIX:
  // 1. Add 'analysisResultText String?' to the Survey model in schema.prisma.
  // 2. Run 'npx prisma generate' and 'npx prisma db push' or a migration.
  try {
    return await prisma.survey.update({
      where: { id: surveyId },
      data: { analysisResultText: analysisText }
    });
  } catch (error: any) {
    // Attempt to detect if the error is due to a missing field.
    // Prisma errors for missing fields in `data` are typically P2002 or validation errors.
    // This is a best-effort guess; proper schema is the real fix.
    if (error.code === 'P2025' || (error.message && error.message.includes("Unknown arg"))) { // P2025 is record not found, but unknown arg is more likely for field
      console.warn(`Failed to store survey analysis for survey ${surveyId}. The 'analysisResultText' field might be missing from the Survey model in schema.prisma. Error: ${error.message}`);
      // Return the survey without the analysis, or re-fetch it if necessary.
      const survey = await prisma.survey.findUnique({ where: { id: surveyId } });
      if (!survey) throw new Error(`Survey ${surveyId} not found after failing to store analysis.`);
      return survey;
    }
    throw error; // Re-throw other errors
  }
}

export async function getSurveyAnalysis(surveyId: string): Promise<string | null> {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: { analysisResultText: true }
  });
  return survey?.analysisResultText || null;
}

export async function getSurveySentiment(
  surveyId: string
): Promise<Array<{ id: string; text: string; sentimentScore: number | null }>> {
  return prisma.question.findMany({
    where: { surveyId },
    select: { id: true, text: true, sentimentScore: true }
  });
}
/**
 * Fetch all surveys for which analysisResultText is not null (i.e., analysis has been stored).
 */
export async function getAnalyzedSurveys(): Promise<Array<{ id: string; objective: string; createdAt: Date }>> {
  return prisma.survey.findMany({
    where: { analysisResultText: { not: null } },
    select: { id: true, objective: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
}
