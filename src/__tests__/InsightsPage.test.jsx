import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InsightsPage from '../pages/InsightsPage';
import { SECTION_HEADINGS } from '../constants';

describe('InsightsPage', () => {
  it('renders insights heading and step label', () => {
    render(
      <InsightsPage
        sections={null}
        loading={false}
        error={null}
        mindfulnessContent={null}
        selectedExam="NEET"
      />
    );

    expect(screen.getByText(/step 3 of 4/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your personalised support/i })).toBeInTheDocument();
    expect(screen.getByText(/NEET prep/i)).toBeInTheDocument();
  });

  it('renders AI insights and mindfulness sections', () => {
    render(
      <InsightsPage
        sections={{
          stressAnalysis: 'Stress noted.',
          copingStrategies: 'Take breaks.',
          mindfulnessExercise: 'Breathe slowly.',
          motivationalMessage: 'You can do this.',
        }}
        loading={false}
        error={null}
        mindfulnessContent="Breathe slowly."
        selectedExam="JEE"
      />
    );

    expect(screen.getByText(/stress noted/i)).toBeInTheDocument();
    expect(screen.getByText(/breathe slowly/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: SECTION_HEADINGS.mindfulness })).toBeInTheDocument();
  });

  it('shows loading state for insights and mindfulness', () => {
    render(
      <InsightsPage
        sections={null}
        loading
        error={null}
        mindfulnessContent={null}
        selectedExam="NEET"
      />
    );

    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });
});
