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
  // NOTE: The 'deployedAt' field is missing from the Survey model in schema.prisma.
  // This function currently does NOT update the deployment status to avoid runtime errors.
  // To fix this:
  // 1. Add 'deployedAt DateTime?' to the Survey model in your schema.prisma file.
  // 2. Run 'npx prisma generate' to update the Prisma client.
  // 3. Run 'npx prisma db push' or create and run a migration to update your database.
  // 4. Uncomment the original code below and remove this workaround.
  const survey = await prisma.survey.findUnique({ where: { id } });
  if (!survey) {
    // Or handle as per your application's error strategy
    throw new Error(`Survey with id ${id} not found for deployment.`);
  }
  return survey;
  // Original code that causes runtime error due to missing 'deployedAt' in schema:
  // return prisma.survey.update({
  //   where: { id },
  //   // @ts-ignore Assuming deployedAt exists in the schema but types are stale
  //   data: { deployedAt: new Date() }
  // });
}

export async function getActiveSurvey(): Promise<(Survey & { questions: Question[] | null }) | null> {
  // NOTE: The 'deployedAt' field is missing from the Survey model in schema.prisma.
  // This function is modified to order by 'createdAt' as a temporary workaround.
  // To correctly fetch by deployment status:
  // 1. Ensure 'deployedAt DateTime?' is in the Survey model in schema.prisma.
  // 2. Run 'npx prisma generate' and update the database.
  // 3. Revert to using 'deployedAt' for filtering and ordering.
  const survey = await prisma.survey.findFirst({
    orderBy: { createdAt: 'desc' }, // Using createdAt as a proxy for the latest survey
    include: { questions: true }
  });

  if (!survey) {
    return null;
  }
  return survey as Survey & { questions: Question[] | null };
}
