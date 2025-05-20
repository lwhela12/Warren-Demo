import { prisma } from '../db/client';

export interface ResponseInput {
  questionId: string;
  answer: string;
}

export async function saveResponses(responses: ResponseInput[]): Promise<void> {
  if (responses.length === 0) return;
  await prisma.response.createMany({ data: responses });
}
