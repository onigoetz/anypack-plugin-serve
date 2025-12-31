const { resolve } = require('node:path');

module.exports = {
  bail: true,
  entry: resolve(__dirname, 'src', 'bail.js'),
  mode: 'development',
};
