import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const mockAnalyzeEntry = vi.fn();
const mockClearError = vi.fn();

vi.mock('../hooks/useGemini', () => ({
  useGemini: () => ({
    analyzeEntry: mockAnalyzeEntry,
    loading: false,
    error: null,
    clearError: mockClearError,
  }),
}));

describe('App', () => {
  beforeEach(() => {
    mockAnalyzeEntry.mockReset();
    mockClearError.mockReset();
    mockAnalyzeEntry.mockResolvedValue({
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

  it('allows submit click to surface validation errors', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /submit journal entry/i }));

    expect(screen.getByText(/few words/i)).toBeInTheDocument();
    expect(screen.getByText(/select how you are feeling/i)).toBeInTheDocument();
    expect(mockAnalyzeEntry).not.toHaveBeenCalled();
  });

  it('submits journal and mood then adds history entry', async () => {
    const user = userEvent.setup();
    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Mock test anxiety today' },
    });
    await user.click(screen.getByRole('button', { name: /Mood 6 of 10/i }));
    await user.click(screen.getByRole('button', { name: /submit journal entry/i }));

    expect(mockAnalyzeEntry).toHaveBeenCalledWith(6, 'Mock test anxiety today');
    expect(await screen.findByText(/1 check-in recorded/i)).toBeInTheDocument();
    expect(screen.getByText(/Stress noted/)).toBeInTheDocument();
  });

  it('renders skip link and landmark regions', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
