const { test, expect } = require('@rstest/core');

const { PluginExistsError, WebpackPluginServeError } = require('../lib/errors');

test('errors', () => {
  expect(new PluginExistsError()).toMatchSnapshot();
  expect(new WebpackPluginServeError()).toMatchSnapshot();
});
