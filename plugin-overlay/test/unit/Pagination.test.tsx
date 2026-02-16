import { afterEach, expect, test } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/preact';

import Pagination from '../../src/modal/Pagination';

function createMockFn() {
  let callCount = 0;
  const fn = () => {
    callCount++;
  };
  fn.getCallCount = () => callCount;
  return fn;
}

afterEach(() => {
  cleanup();
});

test('renders current/total indicator', () => {
  render(
    <Pagination
      current={2}
      total={5}
      onPrevious={() => {}}
      onNext={() => {}}
    />,
  );

  const indicator = screen.getByTestId('pagination-indicator');
  expect(indicator.textContent).toBe('2 / 5');
});

test('previous button is disabled when current is 1', () => {
  render(
    <Pagination
      current={1}
      total={5}
      onPrevious={() => {}}
      onNext={() => {}}
    />,
  );

  const prevButton = screen.getByTestId('pagination-prev');
  expect(prevButton.hasAttribute('disabled')).toBe(true);
});

test('previous button is enabled when current > 1', () => {
  render(
    <Pagination
      current={2}
      total={5}
      onPrevious={() => {}}
      onNext={() => {}}
    />,
  );

  const prevButton = screen.getByTestId('pagination-prev');
  expect(prevButton.hasAttribute('disabled')).toBe(false);
});

test('next button is disabled when current equals total', () => {
  render(
    <Pagination
      current={5}
      total={5}
      onPrevious={() => {}}
      onNext={() => {}}
    />,
  );

  const nextButton = screen.getByTestId('pagination-next');
  expect(nextButton.hasAttribute('disabled')).toBe(true);
});

test('next button is enabled when current < total', () => {
  render(
    <Pagination
      current={3}
      total={5}
      onPrevious={() => {}}
      onNext={() => {}}
    />,
  );

  const nextButton = screen.getByTestId('pagination-next');
  expect(nextButton.hasAttribute('disabled')).toBe(false);
});

test('calls onPrevious when clicking previous button', () => {
  const onPrevious = createMockFn();

  render(
    <Pagination
      current={2}
      total={5}
      onPrevious={onPrevious}
      onNext={() => {}}
    />,
  );

  const prevButton = screen.getByTestId('pagination-prev');
  prevButton.click();

  expect(onPrevious.getCallCount()).toBe(1);
});

test('calls onNext when clicking next button', () => {
  const onNext = createMockFn();

  render(
    <Pagination current={2} total={5} onPrevious={() => {}} onNext={onNext} />,
  );

  const nextButton = screen.getByTestId('pagination-next');
  nextButton.click();

  expect(onNext.getCallCount()).toBe(1);
});

test('previous button has accessible label', () => {
  render(
    <Pagination
      current={2}
      total={5}
      onPrevious={() => {}}
      onNext={() => {}}
    />,
  );

  const prevButton = screen.getByTestId('pagination-prev');
  expect(prevButton.getAttribute('aria-label')).toBe('Previous error');
});

test('next button has accessible label', () => {
  render(
    <Pagination
      current={2}
      total={5}
      onPrevious={() => {}}
      onNext={() => {}}
    />,
  );

  const nextButton = screen.getByTestId('pagination-next');
  expect(nextButton.getAttribute('aria-label')).toBe('Next error');
});

test('navigation has accessible label', () => {
  render(
    <Pagination
      current={2}
      total={5}
      onPrevious={() => {}}
      onNext={() => {}}
    />,
  );

  const nav = screen.getByRole('navigation', { name: 'Error navigation' });
  expect(nav).toBeTruthy();
});
