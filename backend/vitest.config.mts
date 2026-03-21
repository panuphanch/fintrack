import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/services/**',
        'src/utils/**',
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'prisma/**',
        'src/__mocks__/**',
        'src/__fixtures__/**',
        'src/__test-utils__/**',
        'src/**/*.test.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    include: ['src/**/*.test.ts'],
    setupFiles: [],
  },
});
