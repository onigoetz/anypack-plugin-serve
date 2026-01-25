import { pluginPreact } from '@rsbuild/plugin-preact';
import { defineConfig } from '@rslib/core';

const mode = process.env.NODE_ENV || 'development';

/** @type {import('@rspack/cli').Configuration} */
export default defineConfig({
  plugins: [pluginPreact()],
  lib: [
    {
      format: 'esm',
      syntax: 'es2020',
      output: {
        target: 'web',
        injectStyles: true,
      },
      mode,
    },
  ],
});
