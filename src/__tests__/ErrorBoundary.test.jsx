import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

function BrokenChild() {
  throw new Error('Test render failure');
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <p>Content loaded</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('Content loaded')).toBeInTheDocument();
  });

  it('renders accessible fallback when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('resets and re-renders children when Try again is clicked', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    let shouldThrow = true;

    function MaybeBroken() {
      if (shouldThrow) throw new Error('First render failure');
      return <p>Content recovered</p>;
    }

    render(
      <ErrorBoundary>
        <MaybeBroken />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    shouldThrow = false;

    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(screen.getByText('Content recovered')).toBeInTheDocument();
    consoleError.mockRestore();
  });
});
