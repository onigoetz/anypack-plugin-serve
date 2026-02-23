import type { CompilerEntry, RuntimeError } from '../types';

export interface RuntimeTab {
  type: 'runtime';
  id: string;
  label: string;
  runtimeErrors: RuntimeError[];
}

export interface CompilerTab {
  type: 'compiler';
  id: string;
  label: string;
  compiler: CompilerEntry;
}

export type Tab = RuntimeTab | CompilerTab;
