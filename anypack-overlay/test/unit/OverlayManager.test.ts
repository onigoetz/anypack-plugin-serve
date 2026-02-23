import { afterEach, expect, test } from '@rstest/core';
import { init } from '../../src/index';
import OverlayManager from '../../src/OverlayManager';
import { createMockCompiler, createMockError } from '../helpers/mock-compiler';

// Clean up document.body after each test since init() appends directly to it
afterEach(() => {
  document.body.innerHTML = '';
});

test('init creates OverlayManager with DOM container', () => {
  const manager = init();

  expect(manager.compilers).toEqual([]);
  expect(manager.listeners).toEqual([]);

  // Use data-testid for specific container selection
  const container = document.body.querySelector(
    '[data-testid="overlay-container"]',
  );
  expect(container).not.toBeNull();
  expect(container?.tagName).toBe('DIV');

  // Root should be inside container
  const root = container?.querySelector('[data-testid="overlay-root"]');
  expect(root).not.toBeNull();
});

test('addCompiler registers compiler', () => {
  const manager = new OverlayManager();
  const compiler = createMockCompiler({
    connected: true,
    compiler: { done: true, progress: 100, errors: [], warnings: [] },
  });

  manager.addCompiler(compiler);

  expect(manager.compilers.length).toBe(1);
  expect(manager.compilers[0]).toBe(compiler);
});

test('addCompiler sets up onChange listener', () => {
  const manager = new OverlayManager();
  const compiler = createMockCompiler();

  manager.addCompiler(compiler);

  let callCount = 0;
  manager.addListener(() => {
    callCount++;
  });

  compiler.triggerChange();

  expect(callCount).toBe(1);
});

test('addListener returns unsubscribe function', () => {
  const manager = new OverlayManager();
  const listener = () => {};

  const unsubscribe = manager.addListener(listener);

  expect(manager.listeners.length).toBe(1);

  unsubscribe();

  expect(manager.listeners.length).toBe(0);
});

test('render calls all listeners with current compilers', () => {
  const manager = new OverlayManager();
  const calls: { listener: number; compilers: unknown }[] = [];

  manager.addListener((compilers) => {
    calls.push({ listener: 1, compilers });
  });

  manager.addListener((compilers) => {
    calls.push({ listener: 2, compilers });
  });

  manager.render();

  expect(calls.length).toBe(2);
  expect(calls[0].listener).toBe(1);
  expect(calls[0].compilers).toBe(manager.compilers);
  expect(calls[1].listener).toBe(2);
  expect(calls[1].compilers).toBe(manager.compilers);
});

test('unsubscribed listeners are not called', () => {
  const manager = new OverlayManager();
  let callCount = 0;

  const unsubscribe = manager.addListener(() => {
    callCount++;
  });

  manager.render();
  expect(callCount).toBe(1);

  unsubscribe();

  manager.render();
  expect(callCount).toBe(1);
});

test('compiler onChange triggers render', () => {
  const manager = new OverlayManager();

  const compiler = createMockCompiler();
  manager.addCompiler(compiler);

  let renderCount = 0;
  manager.addListener(() => {
    renderCount++;
  });

  compiler.triggerChange();
  expect(renderCount).toBe(1);

  compiler.triggerChange();
  expect(renderCount).toBe(2);
});

test('multiple compilers can be registered', () => {
  const manager = new OverlayManager();
  const compiler1 = createMockCompiler({
    connected: true,
    compiler: { done: false, progress: 30, errors: [], warnings: [] },
  });
  const compiler2 = createMockCompiler({
    connected: false,
    compiler: { done: false, progress: 0, errors: [], warnings: [] },
  });
  const compiler3 = createMockCompiler({
    connected: true,
    compiler: {
      done: true,
      progress: 100,
      errors: [createMockError('Error')],
      warnings: [],
    },
  });

  manager.addCompiler(compiler1);
  manager.addCompiler(compiler2);
  manager.addCompiler(compiler3);

  expect(manager.compilers.length).toBe(3);
  expect(manager.compilers[0]).toBe(compiler1);
  expect(manager.compilers[1]).toBe(compiler2);
  expect(manager.compilers[2]).toBe(compiler3);
});

test('each compiler change triggers render independently', () => {
  const manager = new OverlayManager();
  let renderCount = 0;

  const compiler1 = createMockCompiler();
  const compiler2 = createMockCompiler();

  manager.addCompiler(compiler1);
  manager.addCompiler(compiler2);

  manager.addListener(() => {
    renderCount++;
  });

  compiler1.triggerChange();
  expect(renderCount).toBe(1);

  compiler2.triggerChange();
  expect(renderCount).toBe(2);

  compiler1.triggerChange();
  expect(renderCount).toBe(3);
});
