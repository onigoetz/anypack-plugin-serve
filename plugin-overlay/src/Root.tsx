import { useEffect, useState } from 'preact/hooks';
import MiniStatus from './MiniStatus';
import type OverlayManager from './OverlayManager';
import type { Compiler, CompilerEntry } from './types';

function toState(compilers: Compiler[]): CompilerEntry[] {
  return JSON.parse(JSON.stringify(compilers.map((s) => s.state)));
}

interface RootProps {
  manager: OverlayManager;
}

export default function Root({ manager }: RootProps) {
  const [compilers, setCompilers] = useState<CompilerEntry[]>(
    toState(manager.compilers),
  );
  // TODO :: listen to errors
  const [errors] = useState<unknown[]>([]);

  useEffect(() => {
    return manager.addListener((newData) => {
      setCompilers(toState(newData));
    });
  }, [manager]);

  return (
    <aside data-testid="overlay-root" aria-label="Build overlay">
      <MiniStatus compilers={compilers} errors={errors} />
    </aside>
  );
}
