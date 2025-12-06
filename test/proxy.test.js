const webpack = require('webpack');
const { test, expect, beforeEach, afterEach } = require('@rstest/core');
const fetch = require('node-fetch').default;
const defer = require('../lib/helpers.js').defer;

const { proxyServer } = require('./fixtures/proxy/proxy-server');
const webpackConfig = require('./fixtures/proxy/webpack.config');

const deferred = defer();
const compiler = webpack(webpackConfig);
let watcher;
let server;

beforeEach(async () => {
  server = proxyServer().listen(8888);
  watcher = compiler.watch({}, deferred.resolve);
  await deferred.promise;
});

afterEach(() => {
  server.close();
  watcher.close();
});

test('should reach /api proxy endpoint', async () => {
  const response = await fetch('http://localhost:55556/api');
  const result = await response.text();
  expect(result).toMatchSnapshot();
});

test('should reach /api/test proxy endpoint', async () => {
  const response = await fetch('http://localhost:55556/api/test');
  const result = await response.text();
  expect(result).toMatchSnapshot();
});
