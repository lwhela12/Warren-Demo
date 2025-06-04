import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Apply Prisma schema before each test worker
    setupFiles: ['./vitest.setup.cjs']
  }
});