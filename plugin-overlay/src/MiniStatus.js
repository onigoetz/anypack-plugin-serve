import ConnectionStatus from './ConnectionStatus.js';
import RuntimeIcon from './icons/RuntimeIcon.js';
import styles from './MiniStatus.module.css';
import ProblemBadge from './ProblemBadge.js';

export default function MiniStatus({ compilers, errors }) {
  return (
    <div class={styles.container}>
      <div class={styles.runtimeStatus}>
        {/* TODO: red when there is an error */}
        <RuntimeIcon />
        {errors.length}
      </div>
      <div class={styles.separator}></div>
      <div class={styles.statuses}>
        {compilers.map((compiler) => {
          return (
            <div class={styles.compiler}>
              <ConnectionStatus isConnected={compiler.connected} />
              {!compiler.compiler.done && <>{compiler.compiler.progress}%</>}

              {compiler.compiler.errors.length > 0 && (
                <ProblemBadge
                  size="small"
                  error
                  count={compiler.compiler.errors.length}
                />
              )}

              {compiler.compiler.warnings.length > 0 && (
                <ProblemBadge
                  size="small"
                  warning
                  count={compiler.compiler.warnings.length}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
