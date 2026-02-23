import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/preact';

import {
  ProblemDisplay,
  RuntimeErrorDisplay,
} from '../../src/modal/TabContent';
import {
  createMockError,
  createMockRuntimeError,
} from '../helpers/mock-compiler';

afterEach(() => {
  cleanup();
});

// Runtime error tests
test('shows runtime error message', () => {
  const error = createMockRuntimeError('Something went wrong');

  render(<RuntimeErrorDisplay error={error} />);

  const display = screen.getByTestId('error-message');
  expect(display.textContent).toContain('Something went wrong');
});

test('shows runtime error location when available', () => {
  const error = createMockRuntimeError('Test error', {
    filename: 'app.js',
    lineno: 42,
    colno: 10,
  });

  render(<RuntimeErrorDisplay error={error} />);

  const display = screen.getByTestId('error-location');
  expect(display.textContent).toContain('app.js:42:10');
});

test('shows runtime error stack trace', () => {
  const error = createMockRuntimeError('Test error', {
    stack: 'Error: Test error\n    at foo (app.js:42:10)',
  });

  render(<RuntimeErrorDisplay error={error} />);

  const stack = screen.getByTestId('error-stack');
  expect(stack.textContent).toContain('at foo (app.js:42:10)');
});

test('handles runtime error with missing optional fields', () => {
  const error = createMockRuntimeError('Minimal error', {
    filename: undefined,
    lineno: undefined,
    colno: undefined,
    stack: undefined,
  });

  render(<RuntimeErrorDisplay error={error} />);

  const display = screen.getByTestId('error-message');
  expect(display.textContent).toContain('Minimal error');
  expect(screen.queryByTestId('error-stack')).toBeNull();
});

// Compilation error tests
test('shows compilation error message', () => {
  const error = createMockError('Module not found');

  render(<ProblemDisplay error={error} type="error" />);

  const display = screen.getByTestId('error-message');
  expect(display.textContent).toContain('Module not found');
});

test('shows compilation error module name and location', () => {
  const error = {
    ...createMockError('Error'),
    moduleName: './src/App.tsx',
    loc: '15:3',
  };

  render(<ProblemDisplay error={error} type="error" />);

  const display = screen.getByTestId('error-location');
  expect(display.textContent).toContain('./src/App.tsx');
  expect(display.textContent).toContain('15:3');
});

test('shows compilation error details when available', () => {
  const error = {
    ...createMockError('Error'),
    details: 'Cannot resolve module "missing-pkg"',
  };

  render(<ProblemDisplay error={error} type="error" />);

  const details = screen.getByTestId('error-details');
  expect(details.textContent).toContain('Cannot resolve module "missing-pkg"');
});

test('shows compilation error stack when available', () => {
  const error = {
    ...createMockError('Error'),
    stack: 'at ModuleResolver.resolve (webpack/resolver.js:100)',
  };

  render(<ProblemDisplay error={error} type="error" />);

  const stack = screen.getByTestId('error-stack');
  expect(stack.textContent).toContain('ModuleResolver.resolve');
});

test('shows module trace when available', () => {
  const error = {
    ...createMockError('Error'),
    moduleTrace: [
      {
        originIdentifier: 'origin-1',
        originName: './src/index.ts',
        moduleIdentifier: 'mod-1',
        moduleName: './src/App.tsx',
        dependencies: [{ loc: '5:0-20' }],
        originId: 1,
        moduleId: 2,
      },
    ],
  };

  render(<ProblemDisplay error={error} type="error" />);

  const trace = screen.getByTestId('module-trace');
  expect(trace.textContent).toContain('./src/App.tsx');
  expect(trace.textContent).toContain('5:0-20');
});

test('does not show module trace when empty', () => {
  const error = {
    ...createMockError('Error'),
    moduleTrace: [],
  };

  render(<ProblemDisplay error={error} type="error" />);

  expect(screen.queryByTestId('module-trace')).toBeNull();
});
