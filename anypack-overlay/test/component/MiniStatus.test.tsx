import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/preact';

import MiniStatus from '../../src/MiniStatus';
import type { CompilerEntry } from '../../src/types';
import {
  createMockError,
  createMockRuntimeError,
} from '../helpers/mock-compiler';

// Clean up after each test
afterEach(() => {
  cleanup();
});

test('renders runtime errors count', () => {
  const errors = [
    createMockRuntimeError('error 1'),
    createMockRuntimeError('error 2'),
    createMockRuntimeError('error 3'),
  ];

  render(<MiniStatus compilers={[]} errors={errors} />);

  const runtimeStatus = screen.getByTestId('runtime-status');
  expect(runtimeStatus.textContent).toContain('3');
  expect(runtimeStatus.getAttribute('aria-label')).toBe('3 runtime errors');
});

test('renders single runtime error with singular label', () => {
  const errors = [createMockRuntimeError('error 1')];

  render(<MiniStatus compilers={[]} errors={errors} />);

  const runtimeStatus = screen.getByTestId('runtime-status');
  expect(runtimeStatus.getAttribute('aria-label')).toBe('1 runtime error');
});

test('renders single compiler with progress', () => {
  const compilers: CompilerEntry[] = [
    {
      connected: true,
      compiler: { done: false, progress: 45, errors: [], warnings: [] },
    },
  ];

  render(<MiniStatus compilers={compilers} errors={[]} />);

  const compilerStatuses = screen.getAllByTestId('compiler-status');
  expect(compilerStatuses.length).toBe(1);
  expect(compilerStatuses[0].textContent).toContain('45%');
  expect(compilerStatuses[0].getAttribute('aria-label')).toBe(
    'Compiler 1: 45% complete',
  );
});

test('hides progress when compiler is done', () => {
  const compilers: CompilerEntry[] = [
    {
      connected: true,
      compiler: { done: true, progress: 100, errors: [], warnings: [] },
    },
  ];

  render(<MiniStatus compilers={compilers} errors={[]} />);

  const compilerStatuses = screen.getAllByTestId('compiler-status');
  expect(compilerStatuses[0].textContent).not.toContain('%');
  expect(compilerStatuses[0].getAttribute('aria-label')).toBe(
    'Compiler 1: completed',
  );
});

test('shows error badge when compiler has errors', () => {
  const compilers: CompilerEntry[] = [
    {
      connected: true,
      compiler: {
        done: true,
        progress: 100,
        errors: [createMockError('Error 1'), createMockError('Error 2')],
        warnings: [],
      },
    },
  ];

  render(<MiniStatus compilers={compilers} errors={[]} />);

  const errorBadges = screen
    .getAllByTestId('problem-badge')
    .filter((badge) => badge.getAttribute('data-type') === 'error');

  expect(errorBadges.length).toBe(1);
  expect(errorBadges[0].textContent).toBe('2');
  expect(errorBadges[0].getAttribute('aria-label')).toBe('2 errors');
});

test('shows warning badge when compiler has warnings', () => {
  const compilers: CompilerEntry[] = [
    {
      connected: true,
      compiler: {
        done: true,
        progress: 100,
        errors: [],
        warnings: [
          createMockError('Warning 1'),
          createMockError('Warning 2'),
          createMockError('Warning 3'),
        ],
      },
    },
  ];

  render(<MiniStatus compilers={compilers} errors={[]} />);

  const warningBadges = screen
    .getAllByTestId('problem-badge')
    .filter((badge) => badge.getAttribute('data-type') === 'warning');

  expect(warningBadges.length).toBe(1);
  expect(warningBadges[0].textContent).toBe('3');
  expect(warningBadges[0].getAttribute('aria-label')).toBe('3 warnings');
});

test('does not show badges when no errors or warnings', () => {
  const compilers: CompilerEntry[] = [
    {
      connected: true,
      compiler: { done: true, progress: 100, errors: [], warnings: [] },
    },
  ];

  render(<MiniStatus compilers={compilers} errors={[]} />);

  const badges = screen.queryAllByTestId('problem-badge');
  expect(badges.length).toBe(0);
});

test('renders multiple compilers independently', () => {
  const compilers: CompilerEntry[] = [
    {
      connected: true,
      compiler: { done: false, progress: 30, errors: [], warnings: [] },
    },
    {
      connected: false,
      compiler: { done: false, progress: 0, errors: [], warnings: [] },
    },
    {
      connected: true,
      compiler: {
        done: true,
        progress: 100,
        errors: [createMockError('Error')],
        warnings: [],
      },
    },
  ];

  render(<MiniStatus compilers={compilers} errors={[]} />);

  const compilerStatuses = screen.getAllByTestId('compiler-status');
  expect(compilerStatuses.length).toBe(3);

  // Test each compiler individually
  expect(compilerStatuses[0].getAttribute('data-compiler-index')).toBe('0');
  expect(compilerStatuses[0].textContent).toContain('30%');

  expect(compilerStatuses[1].getAttribute('data-compiler-index')).toBe('1');

  expect(compilerStatuses[2].getAttribute('data-compiler-index')).toBe('2');
  const errorBadge = compilerStatuses[2].querySelector(
    '[data-testid="problem-badge"]',
  );
  expect(errorBadge?.textContent).toBe('1');
});

test('handles empty compilers array', () => {
  render(<MiniStatus compilers={[]} errors={[]} />);

  const miniStatus = screen.getByTestId('mini-status');
  expect(miniStatus).toBeTruthy();

  const compilerStatuses = screen.queryAllByTestId('compiler-status');
  expect(compilerStatuses.length).toBe(0);
});

test('shows both errors and warnings for same compiler', () => {
  const compilers: CompilerEntry[] = [
    {
      connected: true,
      compiler: {
        done: true,
        progress: 100,
        errors: [createMockError('Error 1'), createMockError('Error 2')],
        warnings: [createMockError('Warning 1')],
      },
    },
  ];

  render(<MiniStatus compilers={compilers} errors={[]} />);

  const badges = screen.getAllByTestId('problem-badge');
  expect(badges.length).toBe(2);

  const errorBadge = badges.find(
    (b) => b.getAttribute('data-type') === 'error',
  );
  const warningBadge = badges.find(
    (b) => b.getAttribute('data-type') === 'warning',
  );

  expect(errorBadge?.textContent).toBe('2');
  expect(warningBadge?.textContent).toBe('1');
});

test('shows connection status for each compiler', () => {
  const compilers: CompilerEntry[] = [
    {
      connected: true,
      compiler: { done: true, progress: 100, errors: [], warnings: [] },
    },
    {
      connected: false,
      compiler: { done: false, progress: 0, errors: [], warnings: [] },
    },
  ];

  render(<MiniStatus compilers={compilers} errors={[]} />);

  const connectionStatuses = screen.getAllByTestId('connection-status');
  expect(connectionStatuses.length).toBe(2);
  expect(connectionStatuses[0].getAttribute('data-connected')).toBe('true');
  expect(connectionStatuses[1].getAttribute('data-connected')).toBe('false');
});

test('has proper accessibility structure', () => {
  const compilers: CompilerEntry[] = [
    {
      connected: true,
      compiler: { done: false, progress: 50, errors: [], warnings: [] },
    },
  ];

  render(<MiniStatus compilers={compilers} errors={[]} />);

  const region = screen.getByRole('region', { name: 'Build status' });
  expect(region).toBeTruthy();

  const statuses = screen.getAllByRole('status');
  expect(statuses.length).toBeGreaterThan(0); // At least runtime status + compiler status
});
