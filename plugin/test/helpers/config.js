const path = require('node:path');
const fs = require('node:fs');
const { onTestFinished } = require('@rstest/core');
const { nanoid } = require('nanoid');

const FIXTURES = path.join(__dirname, '../fixtures');

function findServe(config) {
  const configs = Array.isArray(config) ? config : [config];

  const plugins = configs.flatMap((config) => config.plugins);

  return plugins.find(
    (plugin) => plugin.constructor.name === 'AnypackPluginServe',
  );
}

function findPort(config) {
  const serve = findServe(config);
  return serve.options.port;
}

async function readConfig(dir, config = 'webpack.config.js') {
  const file = await import(path.join(dir, config));

  return file.default;
}

async function setupFixtures(base) {
  const src = path.join(FIXTURES, base);
  const dest = path.join(FIXTURES, `temp-${base}-${nanoid(10)}`);
  await fs.promises.mkdir(dest, { recursive: true });
  await fs.promises.cp(src, dest, { recursive: true });

  onTestFinished(async () => {
    await fs.promises.rm(dest, { recursive: true, force: true });
  });

  return dest;
}

module.exports = {
  findServe,
  findPort,
  setupFixtures,
  readConfig,
};
