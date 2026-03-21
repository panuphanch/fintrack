import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/hooks/**',
        'src/components/**',
        'src/lib/**',
      ],
      exclude: [
        'node_modules/**',
        'src/__mocks__/**',
        'src/__fixtures__/**',
        'src/__tests__/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/index.ts',
        'src/components/Layout.tsx',
        'src/components/IconPicker.tsx',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 70,
        lines: 80,
      },
    },
  },
});
