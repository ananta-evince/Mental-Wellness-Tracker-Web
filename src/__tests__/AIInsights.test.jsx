import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AIInsights from '../components/AIInsights';
import { SECTION_HEADINGS } from '../constants';

describe('AIInsights', () => {
  it('shows loading state', () => {
    render(<AIInsights sections={null} loading error={null} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error alert', () => {
    render(<AIInsights sections={null} loading={false} error="Unable to reach companion." />);
    expect(screen.getByRole('alert')).toHaveTextContent(/unable/i);
  });

  it('renders exact problem-brief section headings', () => {
    render(
      <AIInsights
        loading={false}
        error={null}
        sections={{
          stressAnalysis: 'Exam pressure detected.',
          copingStrategies: '1. Walk\n2. Rest',
          motivationalMessage: 'Keep going.',
        }}
      />
    );

    expect(screen.getByText(SECTION_HEADINGS.stress)).toBeInTheDocument();
    expect(screen.getByText(SECTION_HEADINGS.coping)).toBeInTheDocument();
    expect(screen.getByText(/exam pressure detected/i)).toBeInTheDocument();
  });

  it('uses aria-live on response container', () => {
    const { container } = render(
      <AIInsights
        loading={false}
        error={null}
        sections={{ stressAnalysis: 'Hello', copingStrategies: '', motivationalMessage: '' }}
      />
    );

    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });
});
