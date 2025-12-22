const fs = require('node:fs');
const { join } = require('node:path');
const { waitFor } = require('./logs.js');

const puppeteer = require('puppeteer');

async function getPort(stream) {
  const content = await waitFor('Server Listening on: ', stream);
  return content.slice(content.lastIndexOf(':') + 1);
}

async function replace(path, content) {
  await fs.promises.writeFile(path, content);
}

async function setup(base, name) {
  const fixturesPath = join(__dirname, '../fixtures');
  const src = join(fixturesPath, base);
  const dest = join(fixturesPath, `temp-${name}`);
  await fs.promises.mkdir(dest, { recursive: true });
  await fs.promises.cp(src, dest, { recursive: true });

  return dest;
}

async function startBrowser() {
  const instance = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await instance.newPage();
  const util = {
    getPort,
    replace,
    setup,
  };

  return { instance, page, util };
}

async function stopBrowser(browser) {
  await browser.page.close();
  await browser.instance.close();
}

module.exports = { startBrowser, stopBrowser };
