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

test('has role="img" for accessibility', () => {
  render(<CloseIcon />);

  const icon = screen.getByTestId('close-icon');
  expect(icon.getAttribute('role')).toBe('img');
});

test('has aria-labelledby pointing to title', () => {
  render(<CloseIcon />);

  const icon = screen.getByTestId('close-icon');
  const labelledBy = icon.getAttribute('aria-labelledby');
  expect(labelledBy).toBeTruthy();

  const title = icon.querySelector('title');
  expect(title).toBeTruthy();
  expect(title?.id).toBe(labelledBy);
  expect(title?.textContent).toBe('Close');
});

test('renders as SVG element', () => {
  render(<CloseIcon />);

  const icon = screen.getByTestId('close-icon');
  expect(icon.tagName.toLowerCase()).toBe('svg');
});
