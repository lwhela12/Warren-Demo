import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.response.deleteMany();
  await prisma.question.deleteMany();
  await prisma.survey.deleteMany();

  // Load canned objectives from YAML file
  const yamlPath = path.join(__dirname, 'demoObjectives.yaml');
  const file = fs.readFileSync(yamlPath, 'utf8');
  const objectives: string[] = yaml.parse(file);

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