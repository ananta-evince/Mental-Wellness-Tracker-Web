import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../components/Sidebar';
import { APP_PAGES } from '../constants';

describe('Sidebar', () => {
  const defaultProps = {
    activePage: APP_PAGES.EXAM_JOURNEY,
    onNavigate: vi.fn(),
    selectedExam: 'NEET',
    examEmoji: '🩺',
    entryCount: 0,
  };

  it('renders primary navigation with all page links', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Your exam journey' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('button', { name: "Today's check-in" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Your personalised support' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Your journey so far' })).toBeInTheDocument();
  });

  it('calls onNavigate when a nav item is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Sidebar {...defaultProps} onNavigate={onNavigate} />);

    await user.click(screen.getByRole('button', { name: "Today's check-in" }));

    expect(onNavigate).toHaveBeenCalledWith(APP_PAGES.CHECK_IN);
  });

  it('shows exam badge and empty check-in message', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('NEET')).toBeInTheDocument();
    expect(screen.getByText(/no check-ins yet/i)).toBeInTheDocument();
  });

  it('closes mobile menu on Escape key', () => {
    render(<Sidebar {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    expect(screen.getByRole('button', { name: /close navigation menu/i })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
  });

  it('traps focus inside mobile menu when open', () => {
    render(<Sidebar {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    expect(screen.getByRole('button', { name: 'Your exam journey' })).toHaveFocus();
  });
});
