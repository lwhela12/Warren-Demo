import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.response.deleteMany();
  await prisma.question.deleteMany();
  await prisma.survey.deleteMany();

  const survey = await prisma.survey.create({
    data: {
      objective: 'Sample survey objective',
      questions: {
        create: [
          { text: 'What did you think of the lesson?' },
          { text: 'How would you rate the clarity of the instruction?' },
          { text: 'What would you like to see improved?' }
        ]
      }
    },
    include: { questions: true }
  });

  for (const question of survey.questions) {
    await prisma.response.create({
      data: {
        questionId: question.id,
        answer: 'Sample response'
      }
    });
  }

  console.log('Database has been seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });