import { defineConfig } from '@rstest/core';

export default defineConfig({
  include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/fixtures/**',
    '**/helpers/**',
  ],
  testEnvironment: 'happy-dom',
  coverage: {
    include: ['src/**/*.{ts,tsx}'],
    exclude: ['src/**/*.css', 'src/**/*.module.css', 'src/**/*.d.ts'],
    reporters: ['html', ['text', { skipFull: true }]],
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
  tools: {
    swc: {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: {
          react: {
            pragma: 'h',
            pragmaFrag: 'Fragment',
            importSource: 'preact',
            runtime: 'automatic',
          },
        },
      },
    },
  },
});
