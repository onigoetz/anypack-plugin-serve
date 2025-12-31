const { resolve } = require('node:path');

module.exports = [
  {
    context: __dirname,
    entry: resolve(__dirname, 'src', 'entry.js'),
    mode: 'development',
    name: 'entry',
    output: {
      filename: 'nahmain.js',
    },
  },
  {
    context: __dirname,
    entry: resolve(__dirname, 'src', 'yrtne.js'),
    mode: 'production',
    name: 'yrtne',
  },
];
