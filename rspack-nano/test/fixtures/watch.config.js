const { resolve } = require('node:path');

module.exports = {
  context: __dirname,
  entry: resolve(__dirname, 'src', 'entry.js'),
  mode: 'development',
  watch: true,
};
