import ConnectionStatus from './ConnectionStatus';
import RuntimeIcon from './icons/RuntimeIcon';
import styles from './MiniStatus.module.css';
import ProblemBadge from './ProblemBadge';
import type { CompilerEntry } from './types';

interface MiniStatusProps {
  compilers: CompilerEntry[];
  errors: unknown[];
}

export default function MiniStatus({ compilers, errors }: MiniStatusProps) {
  const errorLabel =
    errors.length === 1 ? '1 runtime error' : `${errors.length} runtime errors`;

  return (
    <section
      data-testid="mini-status"
      aria-label="Build status"
      class={styles.container}
    >
      <output
        data-testid="runtime-status"
        aria-label={errorLabel}
        class={styles.runtimeStatus}
      >
        {/* TODO: red when there is an error */}
        <RuntimeIcon />
        {errors.length}
      </output>
      <div class={styles.separator} />
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
                  error
                  count={compiler.compiler.errors.length}
                />
              )}

              {hasWarnings && (
                <ProblemBadge
                  size="small"
                  warning
                  count={compiler.compiler.warnings.length}
                />
              )}
            </output>
          );
        })}
      </div>
    </section>
  );
}
