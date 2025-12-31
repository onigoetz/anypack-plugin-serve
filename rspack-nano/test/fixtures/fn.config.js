const { resolve } = require('node:path');

module.exports = () => {
  return {
    context: __dirname,
    entry: resolve(__dirname, 'src', 'entry.js'),
    mode: 'development',
  };
};
