import { afterEach, expect, test } from '@rstest/core';
import { act, cleanup, render, screen } from '@testing-library/preact';
import OverlayManager from '../../src/OverlayManager';
import Root from '../../src/Root';
import { createMockCompiler, createMockError } from '../helpers/mock-compiler';

// Clean up after each test
afterEach(() => {
  cleanup();
});

function init() {
  const manager = new OverlayManager();

  render(<Root manager={manager} />);

  return manager;
}

test('complete overlay lifecycle with single compiler', async () => {
  const manager = init();

  const container = screen.getByTestId('overlay-root');
  expect(container).not.toBeNull();

  const compiler = createMockCompiler({
    connected: true,
    compiler: { done: false, progress: 0, errors: [], warnings: [] },
  });

  act(() => {
    manager.addCompiler(compiler);
    compiler.triggerChange();
  });

  const compilerStatus = container.querySelector(
    '[data-testid="compiler-status"]',
  );
  expect(compilerStatus?.textContent).toContain('0%');
  expect(compilerStatus?.getAttribute('aria-label')).toBe(
    'Compiler 1: 0% complete',
  );

  // Progress update
  act(() => {
    compiler.setState({
      connected: true,
      compiler: { done: false, progress: 50, errors: [], warnings: [] },
    });
    compiler.triggerChange();
  });

  expect(compilerStatus?.textContent).toContain('50%');
  expect(compilerStatus?.getAttribute('aria-label')).toBe(
    'Compiler 1: 50% complete',
  );

  // Completion with errors and warnings
  act(() => {
    compiler.setState({
      connected: true,
      compiler: {
        done: true,
        progress: 100,
        errors: [
          createMockError('Build error 1'),
          createMockError('Build error 2'),
        ],
        warnings: [createMockError('Warning 1')],
      },
    });
    compiler.triggerChange();
  });

  expect(compilerStatus?.textContent).not.toContain('%');

  const badges = container.querySelectorAll('[data-testid="problem-badge"]');
  const errorBadge = Array.from(badges).find(
    (b) => b.getAttribute('data-type') === 'error',
  );
  const warningBadge = Array.from(badges).find(
    (b) => b.getAttribute('data-type') === 'warning',
  );

  expect(errorBadge?.textContent).toBe('2');
  expect(errorBadge?.getAttribute('aria-label')).toBe('2 errors');
  expect(warningBadge?.textContent).toBe('1');
  expect(warningBadge?.getAttribute('aria-label')).toBe('1 warning');
});

test('handles multiple compilers with different states', async () => {
  const manager = init();

  const compiler1 = createMockCompiler({
    connected: true,
    compiler: { done: false, progress: 25, errors: [], warnings: [] },
  });

  const compiler2 = createMockCompiler({
    connected: true,
    compiler: {
      done: true,
      progress: 100,
      errors: [createMockError('Error')],
      warnings: [],
    },
  });

  act(() => {
    manager.addCompiler(compiler1);
    manager.addCompiler(compiler2);
    compiler1.triggerChange();
    compiler2.triggerChange();
  });

  const container = screen.getByTestId('overlay-root');
  const compilerStatuses = container.querySelectorAll(
    '[data-testid="compiler-status"]',
  );

  expect(compilerStatuses.length).toBe(2);
  expect(compilerStatuses[0].textContent).toContain('25%');

  const errorBadge = container.querySelector(
    '[data-testid="problem-badge"][data-type="error"]',
  );
  expect(errorBadge?.textContent).toBe('1');

  // Update first compiler
  act(() => {
    compiler1.setState({
      connected: true,
      compiler: { done: false, progress: 75, errors: [], warnings: [] },
    });
    compiler1.triggerChange();
  });

  expect(compilerStatuses[0].textContent).toContain('75%');
  expect(errorBadge?.textContent).toBe('1');
});

test('multiple compilers update independently', async () => {
  const manager = init();

  const compiler1 = createMockCompiler({
    connected: true,
    compiler: { done: false, progress: 30, errors: [], warnings: [] },
  });

  const compiler2 = createMockCompiler({
    connected: false,
    compiler: { done: false, progress: 0, errors: [], warnings: [] },
  });

  act(() => {
    manager.addCompiler(compiler1);
    manager.addCompiler(compiler2);
    compiler1.triggerChange();
    compiler2.triggerChange();
  });

  const container = screen.getByTestId('overlay-root');
  const compilerStatuses = container.querySelectorAll(
    '[data-testid="compiler-status"]',
  );

  expect(compilerStatuses[0].textContent).toContain('30%');
  expect(compilerStatuses[1].textContent).toContain('0%');

  // Update second compiler
  act(() => {
    compiler2.setState({
      connected: true,
      compiler: { done: false, progress: 60, errors: [], warnings: [] },
    });
    compiler2.triggerChange();
  });

  expect(compilerStatuses[0].textContent).toContain('30%');
  expect(compilerStatuses[1].textContent).toContain('60%');

  // Complete first compiler
  act(() => {
    compiler1.setState({
      connected: true,
      compiler: { done: true, progress: 100, errors: [], warnings: [] },
    });
    compiler1.triggerChange();
  });

  expect(compilerStatuses[0].textContent).not.toContain('30%');
  expect(compilerStatuses[1].textContent).toContain('60%');
});

test('connection state changes reflect in UI', async () => {
  const manager = init();

  const compiler = createMockCompiler({
    connected: true,
    compiler: { done: false, progress: 50, errors: [], warnings: [] },
  });

  act(() => {
    manager.addCompiler(compiler);
    compiler.triggerChange();
  });

  const container = screen.getByTestId('overlay-root');
  const connectionStatus = container.querySelector(
    '[data-testid="connection-status"]',
  );

  expect(connectionStatus?.getAttribute('data-connected')).toBe('true');
  expect(connectionStatus?.getAttribute('aria-label')).toBe('Connected');

  // Disconnect
  act(() => {
    compiler.setState({
      connected: false,
      compiler: { done: false, progress: 50, errors: [], warnings: [] },
    });
    compiler.triggerChange();
  });

  expect(connectionStatus?.getAttribute('data-connected')).toBe('false');
  expect(connectionStatus?.getAttribute('aria-label')).toBe('Disconnected');
});

test('adding compiler after initialization updates UI', async () => {
  const manager = init();

  const container = screen.getByTestId('overlay-root');
  let compilerStatuses = container.querySelectorAll(
    '[data-testid="compiler-status"]',
  );
  expect(compilerStatuses.length).toBe(0);

  const compiler1 = createMockCompiler({
    connected: true,
    compiler: { done: false, progress: 25, errors: [], warnings: [] },
  });

  act(() => {
    manager.addCompiler(compiler1);
    compiler1.triggerChange();
  });

  compilerStatuses = container.querySelectorAll(
    '[data-testid="compiler-status"]',
  );
  expect(compilerStatuses.length).toBe(1);
  expect(compilerStatuses[0].textContent).toContain('25%');

  const compiler2 = createMockCompiler({
    connected: true,
    compiler: {
      done: true,
      progress: 100,
      errors: [createMockError('Error')],
      warnings: [],
    },
  });

  act(() => {
    manager.addCompiler(compiler2);
    compiler2.triggerChange();
  });

  compilerStatuses = container.querySelectorAll(
    '[data-testid="compiler-status"]',
  );
  expect(compilerStatuses.length).toBe(2);
  expect(compilerStatuses[0].textContent).toContain('25%');

  const errorBadge = container.querySelector(
    '[data-testid="problem-badge"][data-type="error"]',
  );
  expect(errorBadge?.textContent).toBe('1');
});

test('rapid state updates are handled correctly', async () => {
  const manager = init();

  const compiler = createMockCompiler({
    connected: true,
    compiler: { done: false, progress: 0, errors: [], warnings: [] },
  });

  act(() => {
    manager.addCompiler(compiler);
    for (let i = 10; i <= 100; i += 10) {
      compiler.setState({
        connected: true,
        compiler: { done: false, progress: i, errors: [], warnings: [] },
      });
      compiler.triggerChange();
    }
  });

  const container = screen.getByTestId('overlay-root');
  const compilerStatus = container.querySelector(
    '[data-testid="compiler-status"]',
  );
  expect(compilerStatus?.textContent).toContain('100%');
});
