const { join } = require('node:path');
const fs = require('node:fs');

const { execa } = require('execa');
const { test, expect, beforeEach, afterEach, rstest } = require('@rstest/core');

const { logReader, waitFor } = require('../helpers/logs.js');
const { startBrowser, stopBrowser } = require('../helpers/puppeteer');

rstest.setConfig({ testTimeout: 25_000 });

let page, util;
beforeEach(async () => {
  const browser = await startBrowser();
  page = browser.page;
  util = browser.util;

  return async () => {
    await stopBrowser(browser);
  };
});

let fixturePath, proc;
afterEach(async () => {
  if (proc) {
    proc.kill('SIGTERM');
  }

  if (fixturePath) {
    await fs.promises.rm(fixturePath, { recursive: true, force: true });
  }
});

test('single compiler', async () => {
  const { getPort, replace, setup } = util;
  fixturePath = await setup('simple', 'single-hmr');
  proc = execa('wp', [], { cwd: fixturePath });
  const errReader = logReader(proc.stderr);
  const port = await getPort(logReader(proc.stdout));
  const url = `http://localhost:${port}`;

  await waitFor('compiled successfully', errReader);
  await page.goto(url, {
    waitUntil: 'networkidle0',
  });

  const componentPath = join(fixturePath, 'component.js');
  const content = `const main = document.querySelector('main'); main.innerHTML = 'test';`;
  await replace(componentPath, content);
  await waitFor('compiled successfully', errReader);

  await expect
    .poll(async () =>
      page.evaluate(() => document.querySelector('main').innerHTML),
    )
    .toBe('test');
});
