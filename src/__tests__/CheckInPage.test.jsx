import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckInPage from '../pages/CheckInPage';

describe('CheckInPage', () => {
  const defaultProps = {
    loading: false,
    onSubmit: vi.fn().mockResolvedValue(true),
  };

  it('renders check-in form with metric sliders', () => {
    render(<CheckInPage {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /daily check-in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/energy slider/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stress level slider/i)).toBeInTheDocument();
  });

  it('disables submit while loading', () => {
    render(<CheckInPage {...defaultProps} loading />);

    const submit = screen.getByRole('button', { name: /saving/i });
    expect(submit).toBeDisabled();
    expect(submit).toHaveAttribute('aria-busy', 'true');
  });

  it('shows thank you message after successful submit', async () => {
    const user = userEvent.setup();
    render(<CheckInPage {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /submit daily check-in/i }));
    expect(await screen.findByText(/thank you for checking in/i)).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);
    render(<CheckInPage {...defaultProps} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /submit daily check-in/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ energy: 5, stress: 5, confidence: 5 })
    );
  });
});
