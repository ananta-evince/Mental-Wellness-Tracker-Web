import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../components/layout/Sidebar';
import { APP_NAME, APP_PAGES, NAV_ITEMS } from '../constants';

describe('Sidebar', () => {
  const defaultProps = {
    activePage: APP_PAGES.HOME,
    onNavigate: vi.fn(),
    onEmergencyCalm: vi.fn(),
  };

  it('renders primary navigation with all page links', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    NAV_ITEMS.forEach((item) => {
      expect(screen.getByRole('button', { name: item.label })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('calls onNavigate when a nav item is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Sidebar {...defaultProps} onNavigate={onNavigate} />);

    await user.click(screen.getByRole('button', { name: 'Check-in' }));
    expect(onNavigate).toHaveBeenCalledWith(APP_PAGES.CHECK_IN);
  });

  it('shows app name and emergency calm button', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText(APP_NAME)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /emergency calm/i })).toBeInTheDocument();
  });

  it('shows welcome message when userName is provided', () => {
    render(<Sidebar {...defaultProps} userName="Ananya" />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText('Ananya')).toBeInTheDocument();
  });

  it('calls onEmergencyCalm when emergency button is clicked', async () => {
    const user = userEvent.setup();
    const onEmergencyCalm = vi.fn();
    render(<Sidebar {...defaultProps} onEmergencyCalm={onEmergencyCalm} />);

    await user.click(screen.getByRole('button', { name: /emergency calm/i }));
    expect(onEmergencyCalm).toHaveBeenCalled();
  });
});
