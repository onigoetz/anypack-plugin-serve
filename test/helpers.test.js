const { test, expect } = require('@rstest/core');

const { getMajorVersion } = require('../lib/helpers');

test('Get major version with correct value', (t) => {
  const majorVersion = getMajorVersion('5.2.3');
  expect(majorVersion).toEqual('5');
});

test('Get major version with incorrect value', (t) => {
  const majorVersion = getMajorVersion('5');
  expect(majorVersion).toBeFalsy();
});
