const getPort = require('get-port').default;
const { Random } = require('random-js');

const random = new Random();

module.exports = {
  getPort: () => getPort({ port: random.integer(55000, 55555) }),
};
