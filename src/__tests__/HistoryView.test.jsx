import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HistoryView, { buildSparklinePoints } from '../components/HistoryView';

const makeEntry = (id, mood, timestamp) => ({
  id,
  mood,
  timestamp,
  journalText: `Entry ${id}`,
  exam: 'NEET',
});

describe('HistoryView', () => {
  it('shows empty state', () => {
    render(<HistoryView entries={[]} />);
    expect(screen.getByText(/no entries yet/i)).toBeInTheDocument();
  });

  it('shows sparkline for last 7 entries', () => {
    const entries = Array.from({ length: 10 }, (_, i) =>
      makeEntry(String(i), i % 10 + 1, new Date(2026, 0, i + 1).toISOString())
    );

    render(<HistoryView entries={entries} />);
    expect(screen.getByRole('img', { name: /mood trend sparkline/i })).toBeInTheDocument();
    expect(screen.getByText(/last 7 entries/i)).toBeInTheDocument();
  });
});

describe('buildSparklinePoints', () => {
  it('returns coordinates for multiple moods', () => {
    const points = buildSparklinePoints([1, 10]);
    expect(points).toContain('0.0,');
    expect(points).toContain('100.0,');
  });
});
