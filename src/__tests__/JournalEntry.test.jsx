import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JournalEntry from '../components/JournalEntry';
import { MAX_JOURNAL_LENGTH } from '../constants';

describe('JournalEntry', () => {
  it('blocks empty submission when wrapped in a validating form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = e.currentTarget.querySelector('textarea')?.value.trim();
          if (!value) return;
          onSubmit();
        }}
      >
        <JournalEntry value="" onChange={() => {}} />
        <button type="submit">Submit</button>
      </form>
    );

    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('allows submission when text is present', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    function Wrapper() {
      const [value, setValue] = useState('');
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!value.trim()) return;
            onSubmit();
          }}
        >
          <JournalEntry value={value} onChange={setValue} />
          <button type="submit">Submit</button>
        </form>
      );
    }

    render(<Wrapper />);

    await user.type(screen.getByRole('textbox'), 'Feeling stressed about mock tests');
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('enforces the 2000 character limit', () => {
    let current = '';
    const handleChange = vi.fn((next) => {
      current = next;
    });

    const { rerender } = render(<JournalEntry value={current} onChange={handleChange} />);

    const longText = 'a'.repeat(MAX_JOURNAL_LENGTH + 500);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: longText } });

    const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
    expect(lastCall.length).toBeLessThanOrEqual(MAX_JOURNAL_LENGTH);

    rerender(<JournalEntry value={lastCall} onChange={handleChange} />);
    expect(screen.getByText(`${lastCall.length} / ${MAX_JOURNAL_LENGTH} characters`)).toBeInTheDocument();
  });

  it('strips HTML tags from input', () => {
    let current = '';
    render(<JournalEntry value={current} onChange={(v) => { current = v; }} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '<script>alert("x")</script>Hello' },
    });

    expect(current).toBe('Hello');
  });

  it('shows validation error with role alert and aria-invalid', () => {
    render(
      <JournalEntry
        value=""
        onChange={() => {}}
        validationError="Please write at least a few words before submitting."
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/few words/i);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('prevents typing when disabled', () => {
    const onChange = vi.fn();
    render(<JournalEntry value="test" onChange={onChange} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
