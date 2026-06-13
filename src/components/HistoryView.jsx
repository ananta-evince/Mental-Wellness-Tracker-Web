import { useMemo } from 'react';
import { MOOD_EMOJIS, SECTION_HEADINGS } from '../constants';

const SPARKLINE_WINDOW = 7;

/**
 * Builds SVG polyline points for a mood sparkline.
 * @param {number[]} moods
 * @returns {string}
 */
export function buildSparklinePoints(moods) {
  if (moods.length === 0) return '';
  if (moods.length === 1) return '0,15 100,15';

  return moods
    .map((mood, index) => {
      const x = (index / (moods.length - 1)) * 100;
      const y = 30 - ((mood - 1) / 9) * 26;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/**
 * @component
 * Scrollable history of past entries with last-7 mood trend sparkline.
 * @param {{
 *   entries: Array<{ id: string, timestamp: string, journalText: string, mood: number, exam?: string, sections?: object }>
 * }} props
 */
export default function HistoryView({ entries }) {
  const { sortedEntries, lastSevenMoods } = useMemo(() => {
    const chronological = [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      sortedEntries: [...entries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      lastSevenMoods: chronological.slice(-SPARKLINE_WINDOW).map((e) => e.mood),
    };
  }, [entries]);

  const sparklinePoints = useMemo(() => buildSparklinePoints(lastSevenMoods), [lastSevenMoods]);
  const sparklineArea =
    lastSevenMoods.length >= 2 && sparklinePoints ? `${sparklinePoints} 100,32 0,32` : '';

  const avgMood = useMemo(() => {
    if (lastSevenMoods.length === 0) return null;
    return (lastSevenMoods.reduce((sum, m) => sum + m, 0) / lastSevenMoods.length).toFixed(1);
  }, [lastSevenMoods]);

  return (
    <section aria-labelledby="history-heading" className="surface-card">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <span className="section-badge">History</span>
          <h2 id="history-heading" className="mt-2 section-title">
            Your journey so far
          </h2>
          <p className="section-subtitle">
            {entries.length === 0
              ? 'Your entries will appear here after your first check-in.'
              : `${entries.length} check-in${entries.length === 1 ? '' : 's'} recorded`}
          </p>
        </div>

        {lastSevenMoods.length >= 1 && (
          <div className="min-w-[200px] rounded-2xl border border-wellness-100 bg-gradient-to-br from-wellness-50 to-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-wellness-700">
              Mood trend · last {lastSevenMoods.length}
            </p>
            <svg
              viewBox="0 0 100 32"
              className="mt-2 h-12 w-full"
              role="img"
              aria-label={`Mood trend sparkline for last ${lastSevenMoods.length} entries`}
            >
              <defs>
                <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {sparklineArea && <polygon fill="url(#sparkline-fill)" points={sparklineArea} />}
              <polyline
                fill="none"
                stroke="#0d9488"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklinePoints}
              />
            </svg>
            {avgMood && (
              <p className="mt-1 text-xs text-slate-600">
                Avg (last {lastSevenMoods.length}):{' '}
                <span className="font-bold text-wellness-800">{avgMood}/10</span>
              </p>
            )}
          </div>
        )}
      </div>

      <div
        className="mt-6 max-h-[440px] space-y-3 overflow-y-auto pr-1"
        role="list"
        aria-label="Past journal entries"
      >
        {sortedEntries.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
            <span className="text-3xl" aria-hidden="true">
              📔
            </span>
            <p className="mt-3 text-sm font-medium text-slate-700">No entries yet</p>
            <p className="mt-1 text-xs text-slate-500">Your first reflection is just a few taps away.</p>
          </div>
        ) : (
          sortedEntries.map((entry) => (
            <article
              key={entry.id}
              role="listitem"
              className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-wellness-200 hover:shadow-card"
            >
              <header className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {entry.exam && (
                    <span className="rounded-full bg-wellness-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-wellness-800">
                      {entry.exam}
                    </span>
                  )}
                  <time dateTime={entry.timestamp} className="text-xs font-medium text-slate-500">
                    {new Date(entry.timestamp).toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-wellness-50 to-calm-50 px-3 py-1 text-xs font-bold text-wellness-900 ring-1 ring-wellness-100"
                  aria-label={`Mood ${entry.mood} out of 10`}
                >
                  <span aria-hidden="true">{MOOD_EMOJIS[entry.mood]}</span>
                  {entry.mood}/10
                </span>
              </header>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700">{entry.journalText}</p>
              {entry.sections?.copingStrategies && (
                <p className="mt-3 rounded-lg bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900">
                  <span className="font-semibold">{SECTION_HEADINGS.coping}: </span>
                  {entry.sections.copingStrategies.slice(0, 100)}
                  {entry.sections.copingStrategies.length > 100 ? '…' : ''}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
