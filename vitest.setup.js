const { execSync } = require('child_process');
// Apply Prisma schema before tests (run in each worker)
try {
  console.log('Applying Prisma schema to database for tests...');
  execSync('npx prisma db push --schema=server/prisma/schema.prisma --skip-generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to apply Prisma schema before tests:', error);
  process.exit(1);
}