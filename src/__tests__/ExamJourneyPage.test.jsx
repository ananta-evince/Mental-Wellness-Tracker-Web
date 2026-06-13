import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExamJourneyPage from '../pages/ExamJourneyPage';

describe('ExamJourneyPage', () => {
  it('renders onboarding heading and exam selector', () => {
    render(<ExamJourneyPage selectedExam="NEET" onSelect={vi.fn()} disabled={false} />);

    expect(screen.getByRole('heading', { name: /your exam journey/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'NEET' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'JEE' })).toBeInTheDocument();
  });
});
