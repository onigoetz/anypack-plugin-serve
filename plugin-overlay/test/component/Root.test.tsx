import { afterEach, expect, test } from '@rstest/core';
import { act, cleanup, render, screen } from '@testing-library/preact';
import OverlayManager from '../../src/OverlayManager';
import Root from '../../src/Root';
import type { Compiler } from '../../src/types';
import { createMockCompiler } from '../helpers/mock-compiler';

// Clean up after each test
afterEach(() => {
  cleanup();
});

test('initializes with managers current compilers', () => {
  const mockCompiler = createMockCompiler({
    connected: true,
    compiler: { done: true, progress: 100, errors: [], warnings: [] },
  });

  const manager = new OverlayManager();
  manager.addCompiler(mockCompiler);

  render(<Root manager={manager} />);

  const root = screen.getByTestId('overlay-root');
  expect(root).toBeTruthy();
  expect(root.getAttribute('aria-label')).toBe('Build overlay');
});

test('subscribes to manager via addListener', async () => {
  let subscribedCallback: ((compilers: Compiler[]) => void) | null = null;

  const mockManager: OverlayManager = {
    listeners: [],
    compilers: [],
    addCompiler() {},
    render() {},
    addListener: (callback: (compilers: Compiler[]) => void) => {
      subscribedCallback = callback;
      return () => {};
    },
  };

  render(<Root manager={mockManager} />);

  expect(subscribedCallback).not.toBeNull();
  expect(typeof subscribedCallback).toBe('function');
});

test('updates state when manager calls listener', async () => {
  let subscribedCallback: ((compilers: Compiler[]) => void) | null = null;

  const mockCompiler1 = createMockCompiler({
    connected: true,
    compiler: { done: false, progress: 50, errors: [], warnings: [] },
  });

  const mockManager: OverlayManager = {
    listeners: [],
    compilers: [],
    addCompiler() {},
    render() {},
    addListener: (callback: (compilers: Compiler[]) => void) => {
      subscribedCallback = callback;
      return () => {};
    },
  };

  const { container } = render(<Root manager={mockManager} />);

  act(() => {
    subscribedCallback?.([mockCompiler1]);
  });

  expect(container.textContent).toContain('50%');
});

test('returns cleanup function that unsubscribes', async () => {
  let unsubscribeCalled = false;

  const mockManager: OverlayManager = {
    listeners: [],
    compilers: [],
    addCompiler() {},
    render() {},
    addListener: () => {
      return () => {
        unsubscribeCalled = true;
      };
    },
  };

  const { unmount } = render(<Root manager={mockManager} />);

  act(() => {
    unmount();
  });

  expect(unsubscribeCalled).toBe(true);
});

test('renders MiniStatus with compilers and errors', () => {
  const mockCompiler = createMockCompiler({
    connected: true,
    compiler: { done: true, progress: 100, errors: ['Error'], warnings: [] },
  });

  const manager = new OverlayManager();
  manager.addCompiler(mockCompiler);

  render(<Root manager={manager} />);

  const miniStatus = screen.getByTestId('mini-status');
  expect(miniStatus).toBeTruthy();

  // Check that error badge is rendered
  const errorBadge = screen.getByTestId('problem-badge');
  expect(errorBadge.textContent).toBe('1');
});

test('handles empty compilers array', () => {
  const manager = new OverlayManager();

  render(<Root manager={manager} />);

  const root = screen.getByTestId('overlay-root');
  expect(root).toBeTruthy();

  const miniStatus = screen.getByTestId('mini-status');
  expect(miniStatus).toBeTruthy();
});
