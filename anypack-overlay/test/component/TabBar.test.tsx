import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/preact';

import TabBar from '../../src/modal/TabBar';
import type { RuntimeTab, Tab } from '../../src/modal/types';
import type { CompilerEntry } from '../../src/types';
import { createMockError } from '../helpers/mock-compiler';

function createMockFn() {
  let callCount = 0;
  let lastCalledWith: unknown;
  const fn = (arg?: unknown) => {
    callCount++;
    lastCalledWith = arg;
  };
  fn.getCallCount = () => callCount;
  fn.getLastCalledWith = () => lastCalledWith;
  return fn;
}

afterEach(() => {
  cleanup();
});

const runtimeTab: RuntimeTab = {
  id: 'runtime',
  type: 'runtime',
  label: 'Runtime Errors',
  runtimeErrors: [],
};

function createCompilerTab(
  index: number,
  name: string,
  compiler: CompilerEntry,
): Tab {
  return {
    id: `compiler-${index}`,
    type: 'compiler',
    label: name || `Compiler ${index + 1}`,
    compiler,
  };
}

function createCompilerEntry(
  overrides?: Partial<CompilerEntry>,
): CompilerEntry {
  return {
    connected: true,
    compiler: { done: true, progress: 100, errors: [], warnings: [] },
    ...overrides,
  };
}

test('renders runtime errors tab first', () => {
  const tabs = [
    runtimeTab,
    createCompilerTab(0, 'first tab', createCompilerEntry()),
  ];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="runtime"
      onTabChange={() => {}}
      runtimeErrorCount={0}
    />,
  );

  const runtimeTabEl = screen.getByTestId('tab-runtime');
  expect(runtimeTabEl).toBeTruthy();
  expect(runtimeTabEl.textContent).toContain('Runtime Errors');
});

test('renders runtime icon in runtime tab', () => {
  const tabs = [runtimeTab];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="runtime"
      onTabChange={() => {}}
      runtimeErrorCount={0}
    />,
  );

  const runtimeIcon = screen.getByTestId('runtime-icon');
  expect(runtimeIcon).toBeTruthy();
});

test('renders compiler tabs with ConnectionStatus', () => {
  const tabs = [
    runtimeTab,
    createCompilerTab(
      0,
      'API Server',
      createCompilerEntry({ connected: true }),
    ),
  ];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="runtime"
      onTabChange={() => {}}
      runtimeErrorCount={0}
    />,
  );

  const compilerTab = screen.getByTestId('tab-compiler-0');
  expect(compilerTab.textContent).toContain('API Server');

  const connectionStatus = compilerTab.querySelector(
    '[data-testid="connection-status"]',
  );
  expect(connectionStatus).toBeTruthy();
  expect(connectionStatus?.getAttribute('data-connected')).toBe('true');
});

test('shows ProblemBadge with error count for runtime tab', () => {
  const tabs = [runtimeTab];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="runtime"
      onTabChange={() => {}}
      runtimeErrorCount={3}
    />,
  );

  const badge = screen.getByTestId('problem-badge');
  expect(badge.textContent).toBe('3');
  expect(badge.getAttribute('data-type')).toBe('error');
});

test('shows ProblemBadge with error count for compiler tab', () => {
  const tabs = [
    runtimeTab,
    createCompilerTab(
      0,
      'tab',
      createCompilerEntry({
        compiler: {
          done: true,
          progress: 100,
          errors: [createMockError('Error 1'), createMockError('Error 2')],
          warnings: [],
        },
      }),
    ),
  ];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="compiler-0"
      onTabChange={() => {}}
      runtimeErrorCount={0}
    />,
  );

  const compilerTab = screen.getByTestId('tab-compiler-0');
  const errorBadge = compilerTab.querySelector('[data-type="error"]');
  expect(errorBadge?.textContent).toBe('2');
});

test('shows ProblemBadge with warning count for compiler tab', () => {
  const tabs = [
    runtimeTab,
    createCompilerTab(
      0,
      'compiler',
      createCompilerEntry({
        compiler: {
          done: true,
          progress: 100,
          errors: [],
          warnings: [createMockError('Warning 1')],
        },
      }),
    ),
  ];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="compiler-0"
      onTabChange={() => {}}
      runtimeErrorCount={0}
    />,
  );

  const compilerTab = screen.getByTestId('tab-compiler-0');
  const warningBadge = compilerTab.querySelector('[data-type="warning"]');
  expect(warningBadge?.textContent).toBe('1');
});

test('active tab has aria-selected="true"', () => {
  const tabs = [runtimeTab, createCompilerTab(0, 'tab', createCompilerEntry())];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="runtime"
      onTabChange={() => {}}
      runtimeErrorCount={0}
    />,
  );

  const runtimeTabEl = screen.getByTestId('tab-runtime');
  const compilerTabEl = screen.getByTestId('tab-compiler-0');

  expect(runtimeTabEl.getAttribute('aria-selected')).toBe('true');
  expect(compilerTabEl.getAttribute('aria-selected')).toBe('false');
});

test('inactive tabs have tabIndex="-1"', () => {
  const tabs = [runtimeTab, createCompilerTab(0, 'tab', createCompilerEntry())];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="runtime"
      onTabChange={() => {}}
      runtimeErrorCount={0}
    />,
  );

  const runtimeTabEl = screen.getByTestId('tab-runtime');
  const compilerTabEl = screen.getByTestId('tab-compiler-0');

  expect(runtimeTabEl.getAttribute('tabindex')).toBe('0');
  expect(compilerTabEl.getAttribute('tabindex')).toBe('-1');
});

test('click changes active tab', () => {
  const onTabChange = createMockFn();
  const tabs = [runtimeTab, createCompilerTab(0, 'tab', createCompilerEntry())];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="runtime"
      onTabChange={onTabChange}
      runtimeErrorCount={0}
    />,
  );

  const compilerTabEl = screen.getByTestId('tab-compiler-0');
  compilerTabEl.click();

  expect(onTabChange.getLastCalledWith()).toBe('compiler-0');
});

test('arrow right moves to next tab', () => {
  const onTabChange = createMockFn();
  const tabs = [
    runtimeTab,
    createCompilerTab(0, 'tab1', createCompilerEntry()),
    createCompilerTab(1, 'tab2', createCompilerEntry()),
  ];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="runtime"
      onTabChange={onTabChange}
      runtimeErrorCount={0}
    />,
  );

  const runtimeTabEl = screen.getByTestId('tab-runtime');
  runtimeTabEl.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
  );

  expect(onTabChange.getLastCalledWith()).toBe('compiler-0');
});

test('arrow left moves to previous tab', () => {
  const onTabChange = createMockFn();
  const tabs = [
    runtimeTab,
    createCompilerTab(0, 'name', createCompilerEntry()),
  ];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="compiler-0"
      onTabChange={onTabChange}
      runtimeErrorCount={0}
    />,
  );

  const compilerTabEl = screen.getByTestId('tab-compiler-0');
  compilerTabEl.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
  );

  expect(onTabChange.getLastCalledWith()).toBe('runtime');
});

test('home key moves to first tab', () => {
  const onTabChange = createMockFn();
  const tabs = [
    runtimeTab,
    createCompilerTab(0, 'name', createCompilerEntry()),
    createCompilerTab(1, 'name', createCompilerEntry()),
  ];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="compiler-1"
      onTabChange={onTabChange}
      runtimeErrorCount={0}
    />,
  );

  const lastTabEl = screen.getByTestId('tab-compiler-1');
  lastTabEl.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
  );

  expect(onTabChange.getLastCalledWith()).toBe('runtime');
});

test('end key moves to last tab', () => {
  const onTabChange = createMockFn();
  const tabs = [
    runtimeTab,
    createCompilerTab(0, 'name', createCompilerEntry()),
    createCompilerTab(1, 'name', createCompilerEntry()),
  ];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="runtime"
      onTabChange={onTabChange}
      runtimeErrorCount={0}
    />,
  );

  const firstTabEl = screen.getByTestId('tab-runtime');
  firstTabEl.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
  );

  expect(onTabChange.getLastCalledWith()).toBe('compiler-1');
});

test('has tablist role', () => {
  const tabs = [runtimeTab];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="runtime"
      onTabChange={() => {}}
      runtimeErrorCount={0}
    />,
  );

  const tablist = screen.getByRole('tablist', { name: 'Error categories' });
  expect(tablist).toBeTruthy();
});

test('tabs have tab role', () => {
  const tabs = [
    runtimeTab,
    createCompilerTab(0, 'name', createCompilerEntry()),
  ];

  render(
    <TabBar
      tabs={tabs}
      activeTabId="runtime"
      onTabChange={() => {}}
      runtimeErrorCount={0}
    />,
  );

  const allTabs = screen.getAllByRole('tab');
  expect(allTabs.length).toBe(2);
});
