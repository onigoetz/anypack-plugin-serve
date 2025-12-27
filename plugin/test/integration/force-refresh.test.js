const fs = require('node:fs');
const { join } = require('node:path');

const { test, expect, beforeEach, rstest } = require('@rstest/core');

const { setupFixtures, readConfig, findPort } = require('../helpers/config.js');
const { startBrowser } = require('../helpers/puppeteer.js');
const { startWatcher } = require('../helpers/watcher.js');

rstest.setConfig({ testTimeout: 25_000 });

let page;
beforeEach(async () => {
  const browser = await startBrowser();
  page = browser.page;
});

test('force refresh', async () => {
  const fixturePath = await setupFixtures('simple');

  const config = await readConfig(fixturePath);
  const port = await findPort(config);
  const { onCompilationDone } = await startWatcher(config);

  const url = `http://localhost:${port}`;

  await onCompilationDone();
  await page.goto(url, {
    waitUntil: 'networkidle0',
  });

  const componentPath = join(fixturePath, 'component.js');
  const content = `const main = document.querySelector('main'); main.innerHTML = 'test';`;

  await fs.promises.writeFile(componentPath, content);
  await onCompilationDone();

  await expect
    .poll(async () =>
      page.evaluate(() => document.querySelector('main').innerHTML),
    )
    .toBe('test');
});
