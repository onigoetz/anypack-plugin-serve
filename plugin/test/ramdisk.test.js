const { existsSync } = require('node:fs');
const { join, resolve } = require('node:path');

const { test, expect, rstest } = require('@rstest/core');
const { execa } = require('execa');

const { logReader, waitFor } = require('./helpers/logs.js');

rstest.setConfig({ testTimeout: 25_000 });

const fixturePath = join(__dirname, 'fixtures/ramdisk');

test('ramdisk', async () => {
  const proc = execa('wp', [], { cwd: fixturePath });

  const errReader = logReader(proc.stderr);
  const outReader = logReader(proc.stdout);

  const path = await waitFor('Build being written to ', outReader);
  expect(path).toMatch(
    /(volumes|dev\/shm)\/aps\/anypack-plugin-serve\/output/i,
  );

  await waitFor('[emitted]', errReader);
  const exists = existsSync(join(fixturePath, 'output/output.js'));

  expect(exists).toBeTruthy();

  proc.kill('SIGINT');
});

test('ramdisk with options', async () => {
  const proc = execa('wp', ['--config', 'ramdisk/custom-options.js'], {
    cwd: resolve(fixturePath, '..'),
  });

  const errReader = logReader(proc.stderr);
  const outReader = logReader(proc.stdout);

  const path = await waitFor('Build being written to ', outReader);

  expect(path).toMatch(
    /(volumes|dev\/shm)\/aps\/anypack-plugin-serve\/output/i,
  );

  await waitFor('[emitted]', errReader);

  const exists = existsSync(join(fixturePath, 'output/output.js'));

  expect(exists).toBeTruthy();

  proc.kill('SIGINT');
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
  const errReader = logReader(proc.stderr);
  const outReader = logReader(proc.stdout);

  const path = await waitFor('Build being written to ', outReader);
  expect(path).toMatch(/(volumes|dev\/shm)\/aps\/[a-f0-9]{32}\/output/i);

  await waitFor('[emitted]', errReader);
  const exists = existsSync(join(fixturePath, 'output/output.js'));

  expect(exists).toBeTruthy();
});
