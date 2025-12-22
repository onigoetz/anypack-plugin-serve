const { test, expect } = require('@rstest/core');

const { defaults, WebpackPluginServe } = require('../lib');
const { validate } = require('../lib/validate');

test('defaults', () => {
  delete defaults.secure;
  const result = validate(defaults);
  expect(result.error).toBeFalsy();
});

test('client', () => {
  const result = validate({
    client: { address: '0', protocol: 'wss', retry: false, silent: false },
  });
  expect(result.error).toBeFalsy();

  const resultWs = validate({
    client: { address: '0', protocol: 'ws', retry: false, silent: false },
  });
  expect(resultWs.error).toBeFalsy();

  const resultProtocolBad = validate({
    client: { address: '0', protocol: 'lala', retry: false, silent: false },
  });
  expect(resultProtocolBad.error).toBeTruthy();
});

test('error', () => {
  const result = validate({ foo: 'bar' });
  expect(result.error).toMatchSnapshot();
});

test('promise', () => {
  const promise = new Promise(() => {});
  const thenable = {
    // biome-ignore lint/suspicious/noThenProperty: legacy
    then() {},
  };
  let result = validate({ host: 0, port: '0' });
  expect(result.error).toBeTruthy();
  expect(result.error).toMatchSnapshot();
  result = validate({ host: promise, port: promise });
  expect(result.error).toBeFalsy();
  expect(result).toMatchSnapshot();
  result = validate({ host: thenable, port: thenable });
  expect(result.error).toBeFalsy();
  expect(result).toMatchSnapshot();
});

test('throws', () => {
  expect(
    () => new WebpackPluginServe({ batman: 'nanananana' }),
  ).toThrowErrorMatchingSnapshot();
});
