const fs = require('node:fs');
const { join } = require('node:path');
const { unstyle } = require('ansi-colors');

const puppeteer = require('puppeteer');

function getPort(stdout) {
  return new Promise((resolve, reject) => {
    stdout.on('data', (data) => {
      const content = unstyle(data.toString());
      const test = 'Server Listening on: ';
      if (content.includes(test)) {
        resolve(content.slice(content.lastIndexOf(':') + 1));
      }
    });

    stdout.on('error', reject);
  });
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
