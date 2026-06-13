import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckInPage from '../pages/CheckInPage';

describe('CheckInPage', () => {
  const defaultProps = {
    journalText: '',
    onJournalChange: vi.fn(),
    selectedMood: null,
    onMoodSelect: vi.fn(),
    journalError: null,
    moodError: null,
    loading: false,
    onSubmit: vi.fn((event) => event.preventDefault()),
  };

  it('renders check-in form with accessible landmarks', () => {
    render(<CheckInPage {...defaultProps} />);

    expect(screen.getByRole('form', { name: /daily wellness check-in/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /today's check-in/i })).toBeInTheDocument();
    expect(screen.getByText(/step 2 of 4/i)).toBeInTheDocument();
  });

  it('disables submit while loading', () => {
    render(<CheckInPage {...defaultProps} loading />);

    const submit = screen.getByRole('button', { name: /submit journal entry/i });
    expect(submit).toBeDisabled();
    expect(submit).toHaveAttribute('aria-busy', 'true');
  });

  it('shows validation errors', () => {
    render(
      <CheckInPage
        {...defaultProps}
        journalError="Please write at least a few words."
        moodError="Please select how you are feeling."
      />
    );

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    expect(screen.getByText(/few words/i)).toBeInTheDocument();
    expect(screen.getByText(/how you are feeling/i)).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(<CheckInPage {...defaultProps} onSubmit={onSubmit} journalText="Today was tough" selectedMood={5} />);

    await user.click(screen.getByRole('button', { name: /submit journal entry/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
