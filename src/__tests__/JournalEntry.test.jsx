import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JournalEntry from '../components/JournalEntry';
import { MAX_JOURNAL_LENGTH } from '../constants';

describe('JournalEntry', () => {
  it('blocks empty journal submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!e.currentTarget.querySelector('textarea')?.value.trim()) return;
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

  it('enforces the 2000 character limit', () => {
    let current = '';
    const handleChange = vi.fn((next) => {
      current = next;
    });

    render(<JournalEntry value={current} onChange={handleChange} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'a'.repeat(MAX_JOURNAL_LENGTH + 500) },
    });

    const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
    expect(lastCall.length).toBeLessThanOrEqual(MAX_JOURNAL_LENGTH);
  });

  it('strips HTML tags from input', () => {
    let current = '';
    render(<JournalEntry value={current} onChange={(v) => { current = v; }} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '<b>Hello</b> world' },
    });

    expect(current).toBe('Hello world');
  });
});
