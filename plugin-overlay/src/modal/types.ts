export interface RuntimeTab {
  type: 'runtime';
  id: string;
  label: string;
}

export interface CompilerTab {
  type: 'compiler';
  id: string;
  label: string;
  compilerIndex: number;
}

export type Tab = RuntimeTab | CompilerTab;
