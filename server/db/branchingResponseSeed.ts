import { PrismaClient, Node } from '@prisma/client';
import { getEntryNode, getNextNode } from '../services/branchingSurveyService';

const prisma = new PrismaClient();

async function simulateStudent(surveyId: string, entryNode: Node) {
  let currentNode: Node | null = entryNode;
  const responses: { nodeId: string; answer: string }[] = [];

  while (currentNode) {
    if (currentNode.type === 'question-multiple-choice') {
      const options = (currentNode.content as any)?.options;
      if (!options || options.length === 0) {
        break; // Stop if a question has no options
      }
      const answer = options[Math.floor(Math.random() * options.length)];
      responses.push({ nodeId: currentNode.id, answer });
      currentNode = await getNextNode(surveyId, currentNode.id, answer);
    } else {
      currentNode = await getNextNode(surveyId, currentNode.id, '');
    }
  }

  return responses;
}

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

  const entryNode = await getEntryNode(survey.id);
  if (!entryNode) {
    console.error('Could not find an entry node for the survey.');
    return;
  }

  const numberOfStudents = 25;
  let allResponses: { nodeId: string; answer: string }[] = [];

  for (let i = 0; i < numberOfStudents; i++) {
    const studentResponses = await simulateStudent(survey.id, entryNode);
    allResponses.push(...studentResponses);
  }

  if (allResponses.length > 0) {
    await prisma.response.createMany({
      data: allResponses
    });
    console.log(`Successfully seeded ${allResponses.length} responses for ${numberOfStudents} students.`);
  } else {
    console.log('No responses were generated to seed.');
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
