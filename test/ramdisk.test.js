const { existsSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { unstyle } = require('ansi-colors');

const { test, expect, rstest } = require('@rstest/core');
const execa = require('execa');

rstest.setConfig({ testTimeout: 25_000 });

const fixturePath = join(__dirname, 'fixtures/ramdisk');

function waitFor(text, stream) {
  return new Promise((resolve, reject) => {
    console.log('Waiting for', text);
    stream.on('data', (data) => {
      const content = unstyle(data.toString());
      if (content.includes(text)) {
        console.log('Found', text);
        resolve(content.slice(content.lastIndexOf(text) + text.length));
      }
    });

    stream.on('error', reject);
  });
}

test('ramdisk', async () => {
  const proc = execa('wp', [], { cwd: fixturePath });
  const { stderr, stdout } = proc;
  const pathTest = 'Build being written to ';
  const doneTest = '[emitted]';

  const path = await waitFor(pathTest, stdout);

  expect(path).toMatch(/(volumes|mnt)\/wps\/webpack-plugin-serve\/output/i);

  await waitFor(doneTest, stderr);

  const exists = existsSync(join(fixturePath, 'output/output.js'));

  expect(exists).toBeTruthy();

  proc.kill('SIGTERM');
});

test('ramdisk with options', async () => {
  const proc = execa('wp', ['--config', 'ramdisk/custom-options.js'], {
    cwd: resolve(fixturePath, '..'),
  });
  const { stderr, stdout } = proc;
  const pathTest = 'Build being written to ';
  const doneTest = '[emitted]';

  const path = await waitFor(pathTest, stdout);

  expect(path).toMatch(/(volumes|mnt)\/wps\/webpack-plugin-serve\/output/i);

  await waitFor(doneTest, stderr);

  const exists = existsSync(join(fixturePath, 'output/output.js'));

  expect(exists).toBeTruthy();

  proc.kill('SIGTERM');
});

test('context error', async () => {
  try {
    await execa('wp', ['--config', 'ramdisk/config-context-error.js'], {
      cwd: resolve(fixturePath, '..'),
    });
  } catch (e) {
    expect(e.stderr).toMatch(/Please set the `context` to a another path/);
    expect(e.exitCode).toEqual(1);
    return;
  }
  throw new Error('The test should have thrown an error');
});

test('cwd error', async () => {
  try {
    await execa('wp', ['--config', '../config-cwd-error.js'], {
      cwd: join(fixturePath, 'cwd-error'),
    });
  } catch (e) {
    expect(e.stderr).toMatch(/Please run from another path/);
    expect(e.exitCode).toEqual(1);
    return;
  }
  throw new Error('The test should have thrown an error');
});

test('ramdisk with empty package.json', async () => {
  const fixturePath = join(__dirname, 'fixtures/ramdisk-empty-pkg');
  const proc = execa('wp', [], { cwd: fixturePath });
  const { stderr, stdout } = proc;
  const pathTest = 'Build being written to ';
  const doneTest = '[emitted]';

  const path = await waitFor(pathTest, stdout);

  expect(path).toMatch(/(volumes|mnt)\/wps\/[a-f0-9]{32}\/output/i);

  await waitFor(doneTest, stderr);

  const exists = existsSync(join(fixturePath, 'output/output.js'));

  expect(exists).toBeTruthy();
});
