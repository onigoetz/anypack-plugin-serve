import { afterEach, expect, test } from '@rstest/core';
import { act, cleanup, render, screen } from '@testing-library/preact';

import TabContent from '../../src/modal/TabContent';
import type { Tab } from '../../src/modal/types';
import type { CompilerEntry } from '../../src/types';
import {
  createMockError,
  createMockRuntimeError,
} from '../helpers/mock-compiler';

afterEach(() => {
  cleanup();
});

const runtimeTab: Tab = {
  id: 'runtime',
  type: 'runtime',
  label: 'Runtime Errors',
};
const compilerTab: Tab = {
  id: 'compiler-0',
  type: 'compiler',
  label: 'Compiler 1',
  compilerIndex: 0,
};

function createCompilerEntry(
  overrides?: Partial<CompilerEntry>,
): CompilerEntry {
  return {
    connected: true,
    compiler: { done: true, progress: 100, errors: [], warnings: [] },
    ...overrides,
  };
}

test('shows "No runtime errors" when runtime tab is empty', () => {
  render(
    <TabContent activeTab={runtimeTab} runtimeErrors={[]} compilers={[]} />,
  );

  const noErrors = screen.getByTestId('no-errors');
  expect(noErrors.textContent).toContain('No runtime errors');
});

test('shows "No compilation errors" when compiler tab is empty', () => {
  const compilers = [createCompilerEntry()];

  render(
    <TabContent
      activeTab={compilerTab}
      runtimeErrors={[]}
      compilers={compilers}
    />,
  );

  const noErrors = screen.getByTestId('no-errors');
  expect(noErrors.textContent).toContain('No compilation problems');
});

test('renders Pagination when runtime errors exist', () => {
  const errors = [
    createMockRuntimeError('Error 1'),
    createMockRuntimeError('Error 2'),
  ];

  render(
    <TabContent activeTab={runtimeTab} runtimeErrors={errors} compilers={[]} />,
  );

  const pagination = screen.getByTestId('pagination-indicator');
  expect(pagination.textContent).toBe('1 / 2');
});

test('renders Pagination when compilation errors exist', () => {
  const compilers = [
    createCompilerEntry({
      compiler: {
        done: true,
        progress: 100,
        errors: [createMockError('Error 1'), createMockError('Error 2')],
        warnings: [createMockError('Warning 1')],
      },
    }),
  ];

  render(
    <TabContent
      activeTab={compilerTab}
      runtimeErrors={[]}
      compilers={compilers}
    />,
  );

  const pagination = screen.getByTestId('pagination-indicator');
  expect(pagination.textContent).toBe('1 / 3'); // 2 errors + 1 warning
});

test('renders ErrorDisplay for current error', () => {
  const errors = [createMockRuntimeError('First error message')];

  render(
    <TabContent activeTab={runtimeTab} runtimeErrors={errors} compilers={[]} />,
  );

  const errorDisplay = screen.getByTestId('error-display');
  expect(errorDisplay.textContent).toContain('First error message');
});

test('pagination updates current error index', () => {
  const errors = [
    createMockRuntimeError('First error'),
    createMockRuntimeError('Second error'),
  ];

  render(
    <TabContent activeTab={runtimeTab} runtimeErrors={errors} compilers={[]} />,
  );

  // Initially shows first error
  expect(screen.getByTestId('error-display').textContent).toContain(
    'First error',
  );
  expect(screen.getByTestId('pagination-indicator').textContent).toBe('1 / 2');

  // Click next
  act(() => {
    screen.getByTestId('pagination-next').click();
  });

  // Now shows second error
  expect(screen.getByTestId('error-display').textContent).toContain(
    'Second error',
  );
  expect(screen.getByTestId('pagination-indicator').textContent).toBe('2 / 2');
});

test('has tabpanel role', () => {
  render(
    <TabContent activeTab={runtimeTab} runtimeErrors={[]} compilers={[]} />,
  );

  const tabContent = screen.getByTestId('tab-content');
  expect(tabContent.getAttribute('role')).toBe('tabpanel');
});

test('tabpanel references tab with aria-labelledby', () => {
  render(
    <TabContent activeTab={runtimeTab} runtimeErrors={[]} compilers={[]} />,
  );

  const tabContent = screen.getByTestId('tab-content');
  expect(tabContent.getAttribute('aria-labelledby')).toBe('tab-runtime');
  expect(tabContent.getAttribute('id')).toBe('tabpanel-runtime');
});
