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

test('multi compiler', async () => {
  const { getPort, replace, setup, waitForBuild } = util;
  const fixturePath = await setup('multi', 'multi-hmr');
  const proc = execa('wp', [], { cwd: fixturePath });
  const { stdout, stderr } = proc;
  const port = await getPort(stdout);
  const url = `http://localhost:${port}`;

  await waitForBuild(stderr);
  await page.goto(url, {
    waitUntil: 'networkidle0',
  });

  const componentPath = join(fixturePath, 'component.js');
  const workerPath = join(fixturePath, 'work.js');
  const componentContent = `const main = document.querySelector('main'); main.innerHTML = 'test';`;
  const workerContent = `const worker = document.querySelector('#worker'); worker.innerHTML = 'test';`;

  await replace(componentPath, componentContent);
  await waitForBuild(stderr);
  await replace(workerPath, workerContent);
  await waitForBuild(stderr);
  await timers.setTimeout(2_000);

  const componentValue = await page.evaluate(
    () => document.querySelector('main').innerHTML,
  );
  const workValue = await page.evaluate(
    () => document.querySelector('#worker').innerHTML,
  );

  proc.kill('SIGTERM');

  expect(componentValue).toEqual('test');
  expect(workValue).toEqual('test');

  await fs.promises.rm(fixturePath, { recursive: true, force: true });
});
