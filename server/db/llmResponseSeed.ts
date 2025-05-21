import { PrismaClient } from '@prisma/client';
import { generateBulkStudentAnswers } from '../services/claudeService';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const survey = await prisma.survey.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { questions: true }
  });

  if (!survey || !survey.questions || survey.questions.length === 0) {
    console.error('No survey with questions found.');
    return;
  }

  const numberOfStudents = 30;
  const allQuestionAnswers: Record<string, string[]> = {};

  for (const question of survey.questions) {
    try {
      const answers = await generateBulkStudentAnswers(question.text, numberOfStudents);
      allQuestionAnswers[question.id] = answers;
    } catch (err) {
      console.error(`Failed to generate answers for question ${question.id}:`, err);
      allQuestionAnswers[question.id] = new Array(numberOfStudents).fill('Default answer due to LLM error.');
    }
  }

  const responsesToCreate: { questionId: string; answer: string }[] = [];
  for (let i = 0; i < numberOfStudents; i++) {
    for (const question of survey.questions) {
      const answer = allQuestionAnswers[question.id]?.[i] ?? 'Placeholder answer';
      responsesToCreate.push({ questionId: question.id, answer });
    }
  }

  if (responsesToCreate.length > 0) {
    await prisma.response.createMany({ data: responsesToCreate });
    console.log(`Created ${responsesToCreate.length} responses.`);
  } else {
    console.log('No responses created.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
