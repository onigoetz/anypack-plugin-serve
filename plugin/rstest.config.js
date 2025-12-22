const { defineConfig } = require("@rstest/core");

module.exports = defineConfig({
  include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
  exclude: [
    "**/node_modules/**",
    "**/recipes/**",
    "**/fixtures/**",
    "**/helpers/**",
  ],
  coverage: {
    include: ['lib/**/*.{js,mjs}'],
    reporters: [
      "html",
      ["text", { skipFull: true }],
    ],
  },
});
