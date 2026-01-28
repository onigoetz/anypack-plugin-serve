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
    include: ['src/**/*.{js,jsx}'],
    exclude: ['src/**/*.css', 'src/**/*.module.css'],
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
          syntax: 'ecmascript',
          jsx: true,
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
