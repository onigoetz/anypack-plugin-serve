import clsx from 'clsx';
import styles from './ConnectionStatus.module.css';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export default function ConnectionStatus({
  isConnected,
}: ConnectionStatusProps) {
  return (
    <output
      data-testid="connection-status"
      data-connected={isConnected}
      aria-label={isConnected ? 'Connected' : 'Disconnected'}
      class={clsx(
        styles.status,
        isConnected ? styles.statusConnected : styles.statusDisconnected,
      )}
    />
  );
}
