const { test, expect } = require('@rstest/core');

const { PluginExistsError, AnypackPluginServeError } = require('../lib/errors');

test('errors', () => {
  expect(new PluginExistsError()).toMatchSnapshot();
  expect(new AnypackPluginServeError()).toMatchSnapshot();
});
