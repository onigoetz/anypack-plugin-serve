import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/preact';

import CloseIcon from '../../src/icons/CloseIcon';

afterEach(() => {
  cleanup();
});

test('renders with data-testid', () => {
  render(<CloseIcon />);

  const icon = screen.getByTestId('close-icon');
  expect(icon).toBeTruthy();
});

test('renders as SVG element', () => {
  render(<CloseIcon />);

  const icon = screen.getByTestId('close-icon');
  expect(icon.tagName.toLowerCase()).toBe('svg');
});
