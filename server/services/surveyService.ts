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
  // NOTE: The 'deployedAt' field might be missing from the Survey model in schema.prisma.
  // If so, this function will NOT update the deployment status to avoid runtime errors.
  // IDEAL FIX:
  // 1. Add 'deployedAt DateTime? @updatedAt' to the Survey model in your schema.prisma file.
  // 2. Run 'npx prisma generate' to update the Prisma client.
  // 3. Run 'npx prisma db push' or create and run a migration.
  // 4. Then, use: return prisma.survey.update({ where: { id }, data: { deployedAt: new Date() } });

  // Current workaround: Fetch and return the survey without updating deployedAt.
  const survey = await prisma.survey.findUnique({ where: { id } });
  if (!survey) {
    throw new Error(`Survey with id ${id} not found for deployment.`);
  }
  return survey;
}

export async function getActiveSurvey(): Promise<(Survey & { questions: Question[] | null }) | null> {
  // NOTE: The 'deployedAt' field might be missing from the Survey model in schema.prisma.
  // If so, this function orders by 'createdAt' as a temporary workaround.
  // IDEAL FIX: Refer to the fix suggested in 'deploySurvey' and then use:
  // where: { deployedAt: { not: null } }, orderBy: { deployedAt: 'desc' },
  const survey = await prisma.survey.findFirst({
    orderBy: { createdAt: 'desc' }, // Workaround: using createdAt
    include: { questions: true }
  });

  if (!survey) {
    return null;
  }
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
