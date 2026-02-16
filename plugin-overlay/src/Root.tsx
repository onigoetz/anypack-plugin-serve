import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import MiniStatus from './MiniStatus';
import Modal from './modal/Modal';
import type OverlayManager from './OverlayManager';
import type { Compiler, CompilerEntry } from './types';

function toState(compilers: Compiler[]): CompilerEntry[] {
  return JSON.parse(JSON.stringify(compilers.map((s) => s.state)));
}

interface RootProps {
  manager: OverlayManager;
}

export default function Root({ manager }: Readonly<RootProps>) {
  const [compilers, setCompilers] = useState<CompilerEntry[]>(
    toState(manager.compilers),
  );
  const runtimeErrors = manager.errors;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wasManuallyDismissed, setWasManuallyDismissed] = useState(false);
  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    // Trigger a new render as there could be a race condition where
    // event listener is not setup while the first compiler is registered
    setCompilers(toState(manager.compilers));

    return manager.addListener((newData) => {
      setCompilers(toState(newData));
    });
  }, [manager]);

  // Auto-open modal on first error (compilation or runtime)
  useEffect(() => {
    if (wasManuallyDismissed || hasAutoOpenedRef.current) return;

    const hasCompilationErrors = compilers.some(
      (c) => c.compiler.errors.length > 0 || c.compiler.warnings.length > 0,
    );
    const hasRuntimeErrors = runtimeErrors.length > 0;

    if (hasCompilationErrors || hasRuntimeErrors) {
      setIsModalOpen(true);
      hasAutoOpenedRef.current = true;
    }
  }, [compilers, runtimeErrors, wasManuallyDismissed]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setWasManuallyDismissed(true);
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <aside data-testid="overlay-root" aria-label="Build overlay">
      <MiniStatus
        compilers={compilers}
        errors={runtimeErrors}
        onClick={handleOpenModal}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        runtimeErrors={runtimeErrors}
        compilers={compilers}
      />
    </aside>
  );
}
