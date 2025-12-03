const webpack = require('webpack');
const { test, expect, beforeEach, afterEach } = require('@rstest/core');
const fetch = require('node-fetch').default;
const defer = require('p-defer');

const { proxyServer } = require('./fixtures/proxy/proxy-server');
const webpackConfig = require('./fixtures/proxy/proxy-rewrite.config');

const deferred = defer();
const compiler = webpack(webpackConfig);
let server;
let watcher;

beforeEach(async () => {
  server = proxyServer([
    {
      url: '/test',
      handler: async (ctx) => {
        ctx.body = '/test endpoint rewrite';
      },
    },
  ]).listen(8889);
  watcher = compiler.watch({}, deferred.resolve);
  await deferred.promise;
});

afterEach(() => {
  server.close();
  watcher.close();
});

test('should rewrite /api', async () => {
  const response = await fetch('http://localhost:55557/api/test');
  const result = await response.text();
  expect(result).toMatchSnapshot();
});
