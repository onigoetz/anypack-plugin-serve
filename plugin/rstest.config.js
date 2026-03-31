const { defineConfig } = require('@rstest/core');
const { SonarReporter } = require('rstest-sonar-reporter');

module.exports = defineConfig({
  include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  exclude: [
    '**/node_modules/**',
    '**/recipes/**',
    '**/fixtures/**',
    '**/helpers/**',
  ],
  reporters: [
    'default',
    new SonarReporter({
      outputFile: './coverage/sonar-report.xml',
      onWritePath(file) {
        return `plugin/${file}`;
      },
    }),
  ],
  coverage: {
    include: ['lib/**/*.{js,mjs}'],
    reporters: [
      'html',
      ['lcovonly', { projectRoot: '..' }],
      ['text', { skipFull: true }],
    ],
  },
});
