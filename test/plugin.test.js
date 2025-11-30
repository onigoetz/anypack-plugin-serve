const { join } = require('node:path');

const { test, expect } = require('@rstest/core');

const { WebpackPluginServe } = require('../lib');

const reCleanDir = /^.+(serve|project)\//g;
const fixturePath = join(__dirname, 'fixtures').replace(reCleanDir, '');

test('defaults', () => {
  const plugin = new WebpackPluginServe();
  expect(plugin.options).toMatchSnapshot();
});

test('options manipulation', () => {
  const plugin = new WebpackPluginServe({
    allowMany: true,
    compress: true,
    historyFallback: true,
    publicPath: 'dist',
  });
  expect(plugin.options).toMatchSnapshot();
});

test('allow https null', () => {
  const plugin = new WebpackPluginServe({
    allowMany: true,
    https: null,
  });
  expect(plugin.options).toMatchSnapshot();
});

test('static → string', () => {
  const { options } = new WebpackPluginServe({
    allowMany: true,
    static: fixturePath,
  });
  expect(options.static).toMatchSnapshot();
});

test('static → array(string)', () => {
  const { options } = new WebpackPluginServe({
    allowMany: true,
    static: [fixturePath],
  });
  expect(options.static).toMatchSnapshot();
});

test('static → glob', () => {
  const { options } = new WebpackPluginServe({
    allowMany: true,
    static: {
      glob: [join(__dirname, 'fixtures')],
      options: { onlyDirectories: true },
    },
  });
  const res = options.static
    .map((p) => p.replace(reCleanDir, ''))
    .filter((p) => !/temp|output/.test(p))
    .sort();
  expect(res).toMatchSnapshot();
});
