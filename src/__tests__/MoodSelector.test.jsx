import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MoodSelector, { MOOD_VALUES } from '../components/MoodSelector';

describe('MoodSelector', () => {
  it('renders all 10 mood values', () => {
    render(<MoodSelector selectedMood={null} onSelect={() => {}} />);

    MOOD_VALUES.forEach((mood) => {
      expect(
        screen.getByRole('button', { name: new RegExp(`Mood ${mood} of 10`, 'i') })
      ).toBeInTheDocument();
    });
  });

  it('updates aria-pressed when a mood is selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<MoodSelector selectedMood={null} onSelect={onSelect} />);

    const moodThree = screen.getByRole('button', { name: /Mood 3 of 10/i });
    expect(moodThree).toHaveAttribute('aria-pressed', 'false');

    await user.click(moodThree);
    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it('reflects selected mood with aria-pressed true on active button only', () => {
    render(<MoodSelector selectedMood={7} onSelect={() => {}} />);

    MOOD_VALUES.forEach((mood) => {
      const button = screen.getByRole('button', { name: new RegExp(`Mood ${mood} of 10`, 'i') });
      expect(button).toHaveAttribute('aria-pressed', mood === 7 ? 'true' : 'false');
    });
  });

  it('allows selecting each mood value via click', async () => {
    const user = userEvent.setup();
    const selections = [];

    function Wrapper() {
      const [mood, setMood] = useState(null);
      return (
        <MoodSelector
          selectedMood={mood}
          onSelect={(value) => {
            selections.push(value);
            setMood(value);
          }}
        />
      );
    }

    render(<Wrapper />);

    for (const mood of MOOD_VALUES) {
      await user.click(screen.getByRole('button', { name: new RegExp(`Mood ${mood} of 10`, 'i') }));
    }

    expect(selections).toEqual(MOOD_VALUES);
  });

  it('shows mood validation error with role alert', () => {
    render(
      <MoodSelector
        selectedMood={null}
        onSelect={() => {}}
        validationError="Please select how you are feeling on the mood scale."
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/select how you are feeling/i);
  });

  it('does not call onSelect when disabled', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<MoodSelector selectedMood={null} onSelect={onSelect} disabled />);

    await user.click(screen.getByRole('button', { name: /Mood 5 of 10/i }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('selects adjacent mood with arrow keys', () => {
    const onSelect = vi.fn();
    render(<MoodSelector selectedMood={5} onSelect={onSelect} />);

    const moodFive = screen.getByRole('button', { name: /Mood 5 of 10/i });
    fireEvent.keyDown(moodFive, { key: 'ArrowRight' });

    expect(onSelect).toHaveBeenCalledWith(6);
  });
});
