import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MindfulnessCard from '../components/MindfulnessCard';
import { SECTION_HEADINGS } from '../constants';

describe('MindfulnessCard', () => {
  it('renders exact mindfulness section heading', () => {
    render(<MindfulnessCard content={null} />);
    expect(screen.getByText(SECTION_HEADINGS.mindfulness)).toBeInTheDocument();
  });

  it('shows exercise content with aria-live region', () => {
    const { container } = render(
      <MindfulnessCard content="Try box breathing: inhale 4, hold 4, exhale 4." />
    );

    expect(screen.getByText(/box breathing/i)).toBeInTheDocument();
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<MindfulnessCard content={null} loading />);
    expect(screen.getByText(SECTION_HEADINGS.mindfulness)).toBeInTheDocument();
  });
});
