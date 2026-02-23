import { useId } from 'preact/hooks';

export default function CloseIcon() {
  const titleId = useId();

  return (
    <svg
      data-testid="close-icon"
      role="img"
      aria-labelledby={titleId}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={{
        color: 'currentColor',
        width: '1.2em',
        height: '1.2em',
        display: 'block',
      }}
    >
      <title id={titleId}>Close</title>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
