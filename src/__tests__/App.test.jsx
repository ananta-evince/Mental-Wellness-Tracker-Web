import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const mockCall = vi.fn();

vi.mock('../hooks/useGemini', () => ({
  useGemini: () => ({
    data: null,
    loading: false,
    error: null,
    call: mockCall,
  }),
}));

describe('App', () => {
  beforeEach(() => {
    mockCall.mockReset();
    mockCall.mockResolvedValue({
      rawText: 'Insight text',
      sections: {
        stressAnalysis: 'Stress noted',
        copingStrategies: 'Take breaks',
        mindfulnessExercise: 'Breathe',
        motivationalMessage: 'You can do this',
      },
    });
    vi.stubGlobal('crypto', { randomUUID: () => 'test-id-1' });
  });

  it('surfaces validation errors on empty submit', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /submit journal entry/i }));

    expect(screen.getByText(/few words/i)).toBeInTheDocument();
    expect(mockCall).not.toHaveBeenCalled();
  });

  it('includes selected exam in Gemini call', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('radio', { name: 'JEE' }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Mock test anxiety today' },
    });
    await user.click(screen.getByRole('button', { name: /Mood 6 out of 10/i }));
    await user.click(screen.getByRole('button', { name: /submit journal entry/i }));

    expect(mockCall).toHaveBeenCalledWith({
      moodScore: 6,
      journalText: 'Mock test anxiety today',
      exam: 'JEE',
    });
  });

  it('renders nav, header, main, and footer landmarks', () => {
    render(<App />);
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
