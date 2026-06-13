import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AIInsights from '../components/AIInsights';

describe('AIInsights', () => {
  it('shows loading skeleton with aria-busy', () => {
    render(<AIInsights sections={null} loading error={null} />);

    expect(screen.getByRole('heading', { name: /wellness companion/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error alert with message', () => {
    render(<AIInsights sections={null} loading={false} error="Unable to reach the wellness companion." />);

    expect(screen.getByRole('alert')).toHaveTextContent(/unable to reach/i);
  });

  it('shows placeholder when no sections', () => {
    render(<AIInsights sections={null} loading={false} error={null} />);

    expect(screen.getByText(/submit your journal and mood/i)).toBeInTheDocument();
  });

  it('renders labelled insight sections', () => {
    render(
      <AIInsights
        loading={false}
        error={null}
        sections={{
          stressAnalysis: 'Exam pressure is showing up.',
          copingStrategies: '1. Take a walk\n2. Break tasks down',
          mindfulnessExercise: 'Try box breathing for 2 minutes.',
          motivationalMessage: 'You are making progress every day.',
        }}
      />
    );

    expect(screen.getByText(/stress & emotional patterns/i)).toBeInTheDocument();
    expect(screen.getByText(/coping strategies for you/i)).toBeInTheDocument();
    expect(screen.getByText(/mindfulness exercise/i)).toBeInTheDocument();
    expect(screen.getByText(/a note for you/i)).toBeInTheDocument();
    expect(screen.getByText(/exam pressure is showing up/i)).toBeInTheDocument();
  });

  it('omits empty section blocks', () => {
    render(
      <AIInsights
        loading={false}
        error={null}
        sections={{
          stressAnalysis: 'Only stress section',
          copingStrategies: '',
          mindfulnessExercise: '',
          motivationalMessage: '',
        }}
      />
    );

    expect(screen.getByText(/only stress section/i)).toBeInTheDocument();
    expect(screen.queryByText(/coping strategies for you/i)).not.toBeInTheDocument();
  });
});
