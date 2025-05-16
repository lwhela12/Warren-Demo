import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.response.deleteMany();
  await prisma.question.deleteMany();
  await prisma.survey.deleteMany();

  // Canned objectives for demo scenarios
  const objectives = [
    'Improve student engagement in group projects',
    'Enhance understanding of core physics concepts',
    'Boost confidence in mathematical problem solving',
    'Assess clarity of the recent lecture on Shakespearean literature',
    'Gather feedback on effectiveness of peer review sessions'
  ];

  for (const objective of objectives) {
    await prisma.survey.create({ data: { objective } });
  }

  console.log('Demo objectives seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });