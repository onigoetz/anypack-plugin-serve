export function createMockCompiler(initialState) {
  let state = initialState || {
    connected: false,
    compiler: { done: false, progress: 0, errors: [], warnings: [] },
  };

  let changeCallback = null;

  return {
    get state() {
      return state;
    },
    onChange(callback) {
      changeCallback = callback;
    },
    setState(newState) {
      state = newState;
    },
    triggerChange() {
      if (changeCallback) changeCallback();
    },
  };
}
