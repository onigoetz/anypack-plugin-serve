const fs = require('node:fs');
const { join, resolve } = require('node:path');

const { test, expect, rstest, afterEach } = require('@rstest/core');
const { execa } = require('execa');

const { setupFixtures, readConfig } = require('./helpers/config.js');
const { startWatcher } = require('./helpers/watcher.js');

rstest.setConfig({ testTimeout: 25_000 });

const fixturePath = join(__dirname, 'fixtures/ramdisk');

let proc;

afterEach(async () => {
  if (proc) {
    proc.kill('SIGINT');

    // Wait for process shutdown and cleanup
    if (!proc.exitCode) {
      await new Promise((resolve) => {
        proc.on('exit', resolve);
      });
    }
    proc = null;
  }
});

test('ramdisk', async () => {
  const fixturePath = await setupFixtures('ramdisk');

  const config = await readConfig(fixturePath);
  const { onCompilationDone, compiler } = await startWatcher(config);

  const ramdisk = fs.readlinkSync(compiler.outputPath);
  expect(ramdisk).toMatch(
    /(volumes|dev\/shm)\/aps\/anypack-plugin-serve\/output/i,
  );

  await onCompilationDone();
  const exists = fs.existsSync(join(fixturePath, 'output/output.js'));

  expect(exists).toBeTruthy();
});

test('ramdisk with options', async () => {
  const fixturePath = await setupFixtures('ramdisk');
  process.chdir(fixturePath);

  const config = await readConfig(fixturePath, 'custom-options.js');
  const { onCompilationDone, compiler } = await startWatcher(config);

  const ramdisk = fs.readlinkSync(compiler.outputPath);

  expect(ramdisk).toMatch(
    /(volumes|dev\/shm)\/aps\/anypack-plugin-serve\/output/i,
  );

  await onCompilationDone();

  const exists = fs.existsSync(join(fixturePath, 'output/output.js'));

  expect(exists).toBeTruthy();
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
  const fixturePath = await setupFixtures('ramdisk-empty-pkg');
  process.chdir(fixturePath);

  const config = await readConfig(fixturePath);
  const { onCompilationDone, compiler } = await startWatcher(config);

  const ramdisk = fs.readlinkSync(compiler.outputPath);
  expect(ramdisk).toMatch(/(volumes|dev\/shm)\/aps\/[a-f0-9]{32}\/output/i);

  await onCompilationDone();
  const exists = fs.existsSync(join(fixturePath, 'output/output.js'));

  expect(exists).toBeTruthy();
});
