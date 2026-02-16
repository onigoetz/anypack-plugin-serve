import { render } from 'preact';
import OverlayManager from './OverlayManager';
import Root from './Root';

// Re-export types for consumers
export type {
  Compiler,
  CompilerEntry,
  CompilerState,
  OverlayListener,
  RuntimeError,
  Unsubscribe,
  WarningOrError,
} from './types';

export function init(): OverlayManager {
  const manager = new OverlayManager();

  const container = document.createElement('div');
  container.setAttribute('data-testid', 'overlay-container');
  document.body.appendChild(container);
  render(<Root manager={manager} />, container);

  return manager;
}
