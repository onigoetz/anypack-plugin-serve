import { resolve } from 'node:path';

const __dirname = import.meta.dirname;

console.error('esm');

export default {
  context: __dirname,
  entry: resolve(__dirname, 'src', 'entry.js'),
  mode: 'development',
};
