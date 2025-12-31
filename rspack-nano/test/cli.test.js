const { resolve, join } = require('node:path');

const { test, expect, rstest, onTestFinished } = require('@rstest/core');
const { x } = require('tinyexec');
const { unstyle } = require('ansi-colors');

const bin = resolve(__dirname, '../bin/rp.js');
const cwd = resolve(__dirname, './fixtures');

rstest.setConfig({ testTimeout: 5_000 });

const run = (...args) =>
  x('node', [bin].concat(args), { nodeOptions: { cwd } });

test('bad', async () => {
  const result = await run('--config', 'bad.config.js');

  expect(result.exitCode).toEqual(1);
  expect(unstyle(result.stderr)).toContain(
    "Module not found: Can't resolve './src'",
  );
});

test('bad --config.name', async () => {
  const result = await run('--config.ye', 'multi.config.js');

  expect(result.exitCode).toEqual(1);
  expect(unstyle(result.stderr)).toContain(
    "RangeError: A config with name 'ye' was not found in multi.config.js",
  );
});

test('bad --config.name, non-Array', async () => {
  const result = await run('--config.ye', 'rspack.config.js');
  expect(result.exitCode).toEqual(1);
  expect(result.stderr).toContain(
    'A config with name was specified, but the config rspack.config.js does not export an Array',
  );
});

test('bail', async () => {
  const result = await run('--config', 'bail.config.js');
  expect(result.exitCode).toEqual(1);
  expect(unstyle(result.stderr)).toContain(
    "Module not found: Can't resolve 'batman-module.js'",
  );
});

test('json', async () => {
  const { stdout } = await run('--config', 'stats.config.js', '--json');
  const stats = JSON.parse(stdout);

  expect(stats).toEqual(
    expect.objectContaining({
      warnings: [],
      errors: [],
      assetsByChunkName: { main: ['main.js'] },
    }),
  );
  expect(stats.assets).toHaveLength(1);
});

test('watch', async () => {
  const proc = run('--config', 'watch.config.js');

  let content = '';
  proc._streamErr.on('data', (data) => {
    content += unstyle(data.toString('utf-8'));
  });

  onTestFinished(() => {
    proc.kill();
  });

  await expect.poll(() => content).toContain('⬡ rspack: Watching Files');
});

test('--help', async () => {
  const { stderr } = await run('--help');
  expect(unstyle(stderr)).toMatchSnapshot();
});

test('--silent, info', async () => {
  const { stderr } = await run('--config', 'rspack.config.js', '--silent');
  expect(stderr).toBeFalsy();
});

test('--silent, error', async () => {
  try {
    await run('--config', 'bail.config.js', '--silent');
  } catch (err) {
    expect(unstyle(err.stderr)).toBeFalsy();
  }
});

test('--version', async () => {
  const { stderr } = await run('--version');

  expect(stderr).toMatch(/v\d{1,2}\.\d{1,2}\.\d{1,2}/i);
});

test('argv export', () => {
  expect(require('../argv')).toMatchSnapshot();
});

test('no config', async () => {
  const { stderr } = await run();
  expect(unstyle(stderr)).toContain('⬡ rspack: Build Finished');
});

test('--config: commonjs', async () => {
  const { stderr } = await run('--config', 'rspack.config.js');
  expect(unstyle(stderr)).toContain('⬡ rspack: Build Finished');
});

test('--config: esm default export', async () => {
  const { stderr } = await run('--config', 'rspack.config.mjs');
  expect(unstyle(stderr)).toContain('esm');
  expect(unstyle(stderr)).toContain('⬡ rspack: Build Finished');
});

test('--config.name', async () => {
  const { stderr } = await run('--config.yrtne', 'multi.config.js');
  expect(unstyle(stderr)).toContain('⬡ rspack: Build Finished');
});

test('fn', async () => {
  const { stderr } = await run('--config', 'fn.config.js');
  expect(unstyle(stderr)).toContain('⬡ rspack: Build Finished');
});

test('multi', async () => {
  const { stderr } = await run('--config', 'multi.config.js');
  expect(unstyle(stderr)).toContain('⬡ rspack: Build Finished');
});

test('stats', async () => {
  const { stderr } = await run('--config', 'stats.config.js');

  expect(unstyle(stderr)).toContain('rspack: 1 asset');
});

test('zero config', async () => {
  const { stderr } = await x('node', [bin], {
    nodeOptions: { cwd: join(cwd, '/zero') },
  });
  expect(unstyle(stderr)).toContain('⬡ rspack: Build Finished');
});
