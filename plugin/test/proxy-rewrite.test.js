const { test, expect } = require('@rstest/core');

const { startProxyServer } = require('./fixtures/proxy/proxy-server');
const webpackConfig = require('./fixtures/proxy/proxy-rewrite.config');
const { startWatcher } = require('./helpers/watcher.js');

test('should rewrite /api', async () => {
  await startProxyServer(8889, [
    {
      url: '/test',
      handler: async (_req, res) => {
        res.statusCode = 200;
        res.end('/test endpoint rewrite');
      },
    },
  ]);

  await startWatcher(webpackConfig);

  const response = await fetch('http://localhost:55557/api/test');
  const result = await response.text();
  expect(result).toMatchSnapshot();
});
