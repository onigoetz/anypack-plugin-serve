const { join } = require('node:path');
const fs = require('node:fs');
const timers = require('node:timers/promises');

const execa = require('execa');
const { test, expect, beforeEach, rstest } = require('@rstest/core');

rstest.setConfig({ testTimeout: 25_000 });

const { startBrowser, stopBrowser } = require('../helpers/puppeteer');

let page, util;
beforeEach(async () => {
  const browser = await startBrowser();
  page = browser.page;
  util = browser.util;

  return async () => {
    await stopBrowser(browser);
  };
});

test('force refresh', async () => {
  const { getPort, replace, setup, waitForBuild } = util;
  const fixturePath = await setup('simple', 'single-hmr');
  const proc = execa('wp', [], { cwd: fixturePath });
  const { stdout, stderr } = proc;
  const port = await getPort(stdout);
  const url = `http://localhost:${port}`;

  await waitForBuild(stderr);
  await page.goto(url, {
    waitUntil: 'networkidle0',
  });

  const componentPath = join(fixturePath, 'component.js');
  const content = `const main = document.querySelector('main'); main.innerHTML = 'test';`;

  await replace(componentPath, content, true);
  await waitForBuild(stderr);

  await timers.setTimeout(2_000);

  const value = await page.evaluate(
    () => document.querySelector('main').innerHTML,
  );

  proc.kill('SIGTERM');

  expect(value).toEqual('test');

  await fs.promises.rm(fixturePath, { recursive: true, force: true });
});
