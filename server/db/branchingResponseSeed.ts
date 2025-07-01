import { PrismaClient } from '@prisma/client';
import { seedBranchingSurveyResponses } from '../services/branchingSurveyService';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed branching survey responses...');

  const survey = await prisma.survey.findFirst({
    where: {
      nodes: {
        some: {}
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!survey) {
    console.error('No branching surveys found to seed. Please create one first.');
    return;
  }

  console.log(`Seeding responses for survey: "${survey.objective}" (ID: ${survey.id})`);

  const created = await seedBranchingSurveyResponses(survey.id, 25);
  console.log(`Seeded ${created} responses for survey ${survey.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
