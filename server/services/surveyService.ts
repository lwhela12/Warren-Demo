import { prisma } from '../db/client';
import { Survey, Question } from '@prisma/client';

export interface QuestionInput {
  text: string;
}

export async function createWithQuestions(
  objective: string,
  questions: QuestionInput[]
): Promise<Survey & { questions: Question[] }> {
  return prisma.survey.create({
    data: {
      objective,
      questions: {
        create: questions.map((q) => ({ text: q.text }))
      }
    },
    include: { questions: true }
  });
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
