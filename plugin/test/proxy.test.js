const { test, expect } = require('@rstest/core');

const { startProxyServer } = require('./fixtures/proxy/proxy-server');
const { startWatcher } = require('./helpers/watcher.js');
const { readConfig } = require('./helpers/config.js');

test('should reach /api proxy endpoint', async () => {
  await startProxyServer(8888);
  const webpackConfig = await readConfig(`${__dirname}/fixtures/proxy`);
  await startWatcher(webpackConfig);

  const response = await fetch('http://localhost:55556/api');
  const result = await response.text();
  expect(result).toMatchSnapshot();

  const response2 = await fetch('http://localhost:55556/api/test');
  const result2 = await response2.text();
  expect(result2).toMatchSnapshot();
});
