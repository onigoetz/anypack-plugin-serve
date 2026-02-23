import ConnectionStatus from './ConnectionStatus';
import RuntimeIcon from './icons/RuntimeIcon';
import styles from './MiniStatus.module.css';
import ProblemBadge from './ProblemBadge';
import type { CompilerEntry, RuntimeError } from './types';

interface MiniStatusProps {
  compilers: CompilerEntry[];
  errors: RuntimeError[];
  onClick?: () => void;
}

export default function MiniStatus({
  compilers,
  errors,
  onClick,
}: Readonly<MiniStatusProps>) {
  const errorLabel =
    errors.length === 1 ? '1 runtime error' : `${errors.length} runtime errors`;

  const content = (
    <>
      {errors.length > 0 && (
        <>
          <output
            data-testid="runtime-status"
            aria-label={errorLabel}
            class={styles.runtimeStatus}
          >
            <RuntimeIcon />
            <ProblemBadge size="small" type="error" count={errors.length} />
          </output>
          <div class={styles.separator} />
        </>
      )}
      <div class={styles.statuses}>
        {compilers.map((compiler, index) => {
          const hasErrors = compiler.compiler.errors.length > 0;
          const hasWarnings = compiler.compiler.warnings.length > 0;
          const statusParts: string[] = [];

          if (!compiler.compiler.done) {
            statusParts.push(`${compiler.compiler.progress}% complete`);
          }
          if (hasErrors) {
            statusParts.push(`${compiler.compiler.errors.length} errors`);
          }
          if (hasWarnings) {
            statusParts.push(`${compiler.compiler.warnings.length} warnings`);
          }

          const statusLabel =
            statusParts.length > 0
              ? `Compiler ${index + 1}: ${statusParts.join(', ')}`
              : `Compiler ${index + 1}: completed`;

          return (
            <output
              key={index}
              data-testid="compiler-status"
              data-compiler-index={index}
              aria-label={statusLabel}
              class={styles.compiler}
            >
              <ConnectionStatus isConnected={compiler.connected} />
              {!compiler.compiler.done && <>{compiler.compiler.progress}%</>}

              {hasErrors && (
                <ProblemBadge
                  size="small"
                  type="error"
                  count={compiler.compiler.errors.length}
                />
              )}

              {hasWarnings && (
                <ProblemBadge
                  size="small"
                  type="warning"
                  count={compiler.compiler.warnings.length}
                />
              )}
            </output>
          );
        })}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        data-testid="mini-status"
        aria-label="Build status - click to view details"
        class={styles.container}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <section
      data-testid="mini-status"
      aria-label="Build status"
      class={styles.container}
    >
      {content}
    </section>
  );
}
