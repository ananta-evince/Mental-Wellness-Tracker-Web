import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HistoryView, { buildSparklinePoints } from '../components/HistoryView';

const sampleEntries = [
  {
    id: '1',
    timestamp: '2026-06-10T10:00:00.000Z',
    journalText: 'First entry about NEET prep',
    mood: 4,
    sections: { motivationalMessage: 'Keep going!' },
  },
  {
    id: '2',
    timestamp: '2026-06-12T10:00:00.000Z',
    journalText: 'Feeling better after revision',
    mood: 7,
    sections: {
      copingStrategies: 'Short breaks between chapters help a lot.',
      motivationalMessage: 'Proud of you.',
    },
  },
];

describe('HistoryView', () => {
  it('shows empty state when no entries', () => {
    render(<HistoryView entries={[]} />);
    expect(screen.getByText(/no entries yet/i)).toBeInTheDocument();
  });

  it('lists entries newest first', () => {
    render(<HistoryView entries={sampleEntries} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(/feeling better/i);
    expect(items[1]).toHaveTextContent(/first entry/i);
  });

  it('shows sparkline when at least two entries exist', () => {
    render(<HistoryView entries={sampleEntries} />);
    expect(screen.getByRole('img', { name: /mood trend sparkline/i })).toBeInTheDocument();
    expect(screen.getByText(/average mood/i)).toBeInTheDocument();
  });

  it('hides sparkline for single entry', () => {
    render(<HistoryView entries={[sampleEntries[0]]} />);
    expect(screen.queryByRole('img', { name: /mood trend sparkline/i })).not.toBeInTheDocument();
  });

  it('shows coping tip snippet in history cards', () => {
    render(<HistoryView entries={sampleEntries} />);
    expect(screen.getByText(/coping tip:/i)).toBeInTheDocument();
  });
});

describe('buildSparklinePoints', () => {
  it('returns empty string for no moods', () => {
    expect(buildSparklinePoints([])).toBe('');
  });

  it('returns flat line for single mood', () => {
    expect(buildSparklinePoints([5])).toBe('0,15 100,15');
  });

  it('maps multiple moods to coordinates', () => {
    const points = buildSparklinePoints([1, 10]);
    expect(points).toContain('0,');
    expect(points).toContain('100.0,');
  });
});
