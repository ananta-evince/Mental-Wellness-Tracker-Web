import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MoodSelector, { MOOD_VALUES } from '../components/MoodSelector';

describe('MoodSelector', () => {
  it('renders all 10 mood values with aria-label', () => {
    render(<MoodSelector selectedMood={null} onSelect={() => {}} />);

    MOOD_VALUES.forEach((mood) => {
      expect(screen.getByRole('button', { name: `Mood ${mood} out of 10` })).toBeInTheDocument();
    });
  });

  it('updates aria-pressed when selected', () => {
    render(<MoodSelector selectedMood={7} onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Mood 7 out of 10' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('range slider has step 1', () => {
    render(<MoodSelector selectedMood={5} onSelect={() => {}} />);
    expect(screen.getByRole('slider')).toHaveAttribute('step', '1');
  });

  it('selects mood via click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MoodSelector selectedMood={null} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Mood 3 out of 10' }));
    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it('navigates moods with arrow keys', () => {
    const onSelect = vi.fn();
    render(<MoodSelector selectedMood={5} onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Mood 5 out of 10' }), {
      key: 'ArrowRight',
    });
    expect(onSelect).toHaveBeenCalledWith(6);
  });

  it('navigates with ArrowLeft, Home, and End keys', () => {
    const onSelect = vi.fn();
    render(<MoodSelector selectedMood={5} onSelect={onSelect} />);
    const current = screen.getByRole('button', { name: 'Mood 5 out of 10' });

    fireEvent.keyDown(current, { key: 'ArrowLeft' });
    expect(onSelect).toHaveBeenCalledWith(4);

    fireEvent.keyDown(current, { key: 'Home' });
    expect(onSelect).toHaveBeenCalledWith(1);

    fireEvent.keyDown(current, { key: 'End' });
    expect(onSelect).toHaveBeenCalledWith(10);
  });

  it('updates mood via range slider', () => {
    const onSelect = vi.fn();
    render(<MoodSelector selectedMood={5} onSelect={onSelect} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } });
    expect(onSelect).toHaveBeenCalledWith(8);
  });

  it('shows validation error with role alert', () => {
    render(
      <MoodSelector
        selectedMood={null}
        onSelect={() => {}}
        validationError="Please select how you are feeling."
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/how you are feeling/i);
  });
});
