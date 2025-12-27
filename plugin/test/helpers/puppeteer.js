const puppeteer = require('puppeteer');
const { onTestFinished } = require('@rstest/core');

async function startBrowser() {
  const instance = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await instance.newPage();

  onTestFinished(async () => {
    await page.close();
    await instance.close();
  });

  return { instance, page };
}

module.exports = { startBrowser };
