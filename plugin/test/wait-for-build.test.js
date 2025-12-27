const fs = require('node:fs');
const { test, expect, afterEach } = require('@rstest/core');

const { getPort } = require('./helpers/port');
const { make } = require('./fixtures/wait-for-build/make-config');
const { startWatcher } = require('./helpers/watcher.js');

afterEach(async () => {
  await fs.promises.rm('./test/fixtures/waitForBuild/output', {
    recursive: true,
    force: true,
  });
});

test('should wait until bundle is compiled', async () => {
  const port = await getPort();
  const { config } = make(port);
  await startWatcher(config);

  const response = await fetch(`http://localhost:${port}/test`);
  const text = await response.text();
  expect(text).toEqual('success');
});
