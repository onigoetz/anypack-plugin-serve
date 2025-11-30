const { writeFileSync } = require('node:fs');
const { join } = require('node:path');

const copy = require('cpy');
const mkdir = require('make-dir');
const puppeteer = require('puppeteer');
const strip = require('strip-ansi');

const getPort = (stdout) => {
  return {
    // biome-ignore lint/suspicious/noThenProperty: legacy
    then(r, f) {
      stdout.on('data', (data) => {
        const content = strip(data.toString());
        const test = 'Server Listening on: ';
        if (content.includes(test)) {
          r(content.slice(content.lastIndexOf(':') + 1));
        }
      });

      stdout.on('error', f);
    },
  };
};

const replace = (path, content) => {
  return {
    // biome-ignore lint/suspicious/noThenProperty: legacy
    then(r) {
      writeFileSync(path, content);
      setTimeout(r, 5000);
    },
  };
};

const setup = async (base, name) => {
  const fixturesPath = join(__dirname, '../fixtures');
  const src = join(fixturesPath, base);
  const dest = await mkdir(join(fixturesPath, `temp-${name}`));
  await copy(`${src}/*`, dest);

  return dest;
};

const waitForBuild = (stderr) => {
  return {
    // biome-ignore lint/suspicious/noThenProperty: legacy
    then(r) {
      stderr.on('data', (data) => {
        const content = strip(data.toString());
        if (/webpack: Hash:/.test(content)) {
          r();
        }
      });
    },
  };
};

const browser = async (t, run) => {
  const instance = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await instance.newPage();
  const util = {
    getPort,
    replace,
    setup,
    waitForBuild,
  };
  try {
    await run(t, page, util);
  } finally {
    await page.close();
    await instance.close();
  }
};

module.exports = { browser };
