export interface Tab {
  id: string;
  type: 'runtime' | 'compiler';
  label: string;
  compilerIndex?: number;
}
