import { afterEach, expect, test } from '@rstest/core';
import { act, cleanup, render, screen } from '@testing-library/preact';

import Modal from '../../src/modal/Modal';
import type { CompilerEntry } from '../../src/types';
import {
  createMockError,
  createMockRuntimeError,
} from '../helpers/mock-compiler';

function createMockFn() {
  let callCount = 0;
  const fn = () => {
    callCount++;
  };
  fn.getCallCount = () => callCount;
  return fn;
}

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

function createCompilerEntry(
  overrides?: Partial<CompilerEntry>,
): CompilerEntry {
  return {
    connected: true,
    compiler: { done: true, progress: 100, errors: [], warnings: [] },
    ...overrides,
  };
}

test('does not render when isOpen=false', () => {
  render(
    <Modal
      isOpen={false}
      onClose={() => {}}
      runtimeErrors={[]}
      compilers={[]}
    />,
  );

  expect(screen.queryByTestId('modal')).toBeNull();
});

test('renders when isOpen=true', () => {
  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      runtimeErrors={[]}
      compilers={[]}
    />,
  );

  const modal = screen.getByTestId('modal');
  expect(modal).toBeTruthy();
});

test('renders in portal (document.body)', () => {
  render(
    <div data-testid="parent">
      <Modal
        isOpen={true}
        onClose={() => {}}
        runtimeErrors={[]}
        compilers={[]}
      />
    </div>,
  );

  // Modal should be a direct child of body, not inside parent div
  const backdrop = screen.getByTestId('modal-backdrop');
  expect(backdrop.parentElement).toBe(document.body);
});

test('calls onClose when clicking backdrop', () => {
  const onClose = createMockFn();

  render(
    <Modal isOpen={true} onClose={onClose} runtimeErrors={[]} compilers={[]} />,
  );

  const backdrop = screen.getByTestId('modal-backdrop');
  backdrop.click();

  expect(onClose.getCallCount()).toBe(1);
});

test('does not close when clicking modal content', () => {
  const onClose = createMockFn();

  render(
    <Modal isOpen={true} onClose={onClose} runtimeErrors={[]} compilers={[]} />,
  );

  const modal = screen.getByTestId('modal');
  modal.click();

  expect(onClose.getCallCount()).toBe(0);
});

test('calls onClose when pressing Escape', () => {
  const onClose = createMockFn();

  render(
    <Modal isOpen={true} onClose={onClose} runtimeErrors={[]} compilers={[]} />,
  );

  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  });

  expect(onClose.getCallCount()).toBe(1);
});

test('close button calls onClose', () => {
  const onClose = createMockFn();

  render(
    <Modal isOpen={true} onClose={onClose} runtimeErrors={[]} compilers={[]} />,
  );

  const closeButton = screen.getByTestId('modal-close');
  closeButton.click();

  expect(onClose.getCallCount()).toBe(1);
});

test('close button has accessible label', () => {
  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      runtimeErrors={[]}
      compilers={[]}
    />,
  );

  const closeButton = screen.getByTestId('modal-close');
  expect(closeButton.getAttribute('aria-label')).toBe('Close modal');
});

test('contains TabBar', () => {
  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      runtimeErrors={[]}
      compilers={[]}
    />,
  );

  const tabBar = screen.getByRole('tablist');
  expect(tabBar).toBeTruthy();
});

test('contains TabContent', () => {
  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      runtimeErrors={[]}
      compilers={[]}
    />,
  );

  const tabContent = screen.getByTestId('tab-content');
  expect(tabContent).toBeTruthy();
});

test('sets body.style.overflow = "hidden" when open', () => {
  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      runtimeErrors={[]}
      compilers={[]}
    />,
  );

  expect(document.body.style.overflow).toBe('hidden');
});

test('restores body overflow when closed', () => {
  const { rerender } = render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      runtimeErrors={[]}
      compilers={[]}
    />,
  );

  expect(document.body.style.overflow).toBe('hidden');

  rerender(
    <Modal
      isOpen={false}
      onClose={() => {}}
      runtimeErrors={[]}
      compilers={[]}
    />,
  );

  expect(document.body.style.overflow).toBe('');
});

test('shows runtime errors tab by default', () => {
  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      runtimeErrors={[]}
      compilers={[]}
    />,
  );

  const runtimeTab = screen.getByTestId('tab-runtime');
  expect(runtimeTab.getAttribute('aria-selected')).toBe('true');
});

test('shows compiler tabs when compilers are provided', () => {
  const compilers = [
    createCompilerEntry({ name: 'API Server' }),
    createCompilerEntry({ name: 'Database' }),
  ];

  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      runtimeErrors={[]}
      compilers={compilers}
    />,
  );

  const apiTab = screen.getByTestId('tab-compiler-0');
  const dbTab = screen.getByTestId('tab-compiler-1');

  expect(apiTab.textContent).toContain('API Server');
  expect(dbTab.textContent).toContain('Database');
});

test('uses fallback name for compilers without name', () => {
  const compilers = [createCompilerEntry()];

  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      runtimeErrors={[]}
      compilers={compilers}
    />,
  );

  const tab = screen.getByTestId('tab-compiler-0');
  expect(tab.textContent).toContain('Compiler 1');
});

test('displays runtime errors in content', () => {
  const errors = [createMockRuntimeError('Test runtime error')];

  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      runtimeErrors={errors}
      compilers={[]}
    />,
  );

  const errorDisplay = screen.getByTestId('error-display');
  expect(errorDisplay.textContent).toContain('Test runtime error');
});

test('displays compilation errors when compiler tab is selected', () => {
  const compilers = [
    createCompilerEntry({
      compiler: {
        done: true,
        progress: 100,
        errors: [createMockError('Build failed')],
        warnings: [],
      },
    }),
  ];

  render(
    <Modal
      isOpen={true}
      onClose={() => {}}
      runtimeErrors={[]}
      compilers={compilers}
    />,
  );

  // Click on compiler tab
  act(() => {
    screen.getByTestId('tab-compiler-0').click();
  });

  const errorDisplay = screen.getByTestId('error-display');
  expect(errorDisplay.textContent).toContain('Build failed');
});
