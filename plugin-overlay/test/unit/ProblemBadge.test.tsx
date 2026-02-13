import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/preact';

import ProblemBadge from '../../src/ProblemBadge';

// Clean up after each test
afterEach(() => {
  cleanup();
});

test('renders error badge with count', () => {
  render(<ProblemBadge count={5} error />);

  const badge = screen.getByTestId('problem-badge');
  expect(badge.textContent).toBe('5');
  expect(badge.getAttribute('data-type')).toBe('error');
  expect(badge.getAttribute('aria-label')).toBe('5 errors');
  expect(badge.getAttribute('aria-live')).toBe('polite');
});

test('renders warning badge with count', () => {
  render(<ProblemBadge count={3} warning />);

  const badge = screen.getByTestId('problem-badge');
  expect(badge.textContent).toBe('3');
  expect(badge.getAttribute('data-type')).toBe('warning');
  expect(badge.getAttribute('aria-label')).toBe('3 warnings');
});

test('renders small size badge', () => {
  render(<ProblemBadge count={1} error size="small" />);

  const badge = screen.getByTestId('problem-badge');
  expect(badge.textContent).toBe('1');
  expect(badge.getAttribute('aria-label')).toBe('1 error'); // Singular
  expect(badge.className).toContain('small');
});

test('renders zero count', () => {
  render(<ProblemBadge count={0} warning />);

  const badge = screen.getByTestId('problem-badge');
  expect(badge.textContent).toBe('0');
  expect(badge.getAttribute('aria-label')).toBe('0 warnings');
});

test('renders large count', () => {
  render(<ProblemBadge count={999} error />);

  const badge = screen.getByTestId('problem-badge');
  expect(badge.textContent).toBe('999');
  expect(badge.getAttribute('aria-label')).toBe('999 errors');
});

test('applies only error type when error prop is true', () => {
  render(<ProblemBadge count={2} error />);

  const badge = screen.getByTestId('problem-badge');
  expect(badge.getAttribute('data-type')).toBe('error');
  expect(badge.className).toContain('error');
  expect(badge.className).not.toContain('warning');
});

test('applies only warning type when warning prop is true', () => {
  render(<ProblemBadge count={2} warning />);

  const badge = screen.getByTestId('problem-badge');
  expect(badge.getAttribute('data-type')).toBe('warning');
  expect(badge.className).toContain('warning');
  expect(badge.className).not.toContain('error');
});

test('can be found by accessible role and name', () => {
  render(<ProblemBadge count={3} error />);

  const badge = screen.getByRole('status', { name: '3 errors' });
  expect(badge).toBeTruthy();
});

test('uses singular form for count of 1', () => {
  render(<ProblemBadge count={1} warning />);

  const badge = screen.getByRole('status', { name: '1 warning' });
  expect(badge).toBeTruthy();
});
