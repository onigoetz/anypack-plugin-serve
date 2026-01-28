import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/preact';

import ConnectionStatus from '../../src/ConnectionStatus.js';

// Clean up after each test
afterEach(() => {
  cleanup();
});

test('renders connected status', () => {
  render(<ConnectionStatus isConnected={true} />);

  const status = screen.getByTestId('connection-status');
  expect(status).toBeTruthy();
  expect(status.getAttribute('data-connected')).toBe('true');
  expect(status.getAttribute('aria-label')).toBe('Connected');
});

test('renders disconnected status', () => {
  render(<ConnectionStatus isConnected={false} />);

  const status = screen.getByTestId('connection-status');
  expect(status).toBeTruthy();
  expect(status.getAttribute('data-connected')).toBe('false');
  expect(status.getAttribute('aria-label')).toBe('Disconnected');
});

test('can be found by accessible role and name', () => {
  render(<ConnectionStatus isConnected={true} />);

  const status = screen.getByRole('status', { name: 'Connected' });
  expect(status).toBeTruthy();
});
