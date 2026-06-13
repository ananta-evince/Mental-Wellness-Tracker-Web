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
  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [entries]
  );

  const lastSevenMoods = useMemo(
    () =>
      [...entries]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .slice(-SPARKLINE_WINDOW)
        .map((e) => e.mood),
    [entries]
  );

  const sparklinePoints = useMemo(() => buildSparklinePoints(lastSevenMoods), [lastSevenMoods]);

  const avgMood = useMemo(() => {
    if (lastSevenMoods.length === 0) return null;
    return (lastSevenMoods.reduce((sum, m) => sum + m, 0) / lastSevenMoods.length).toFixed(1);
  }, [lastSevenMoods]);

  return (
    <section aria-labelledby="history-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="history-heading" className="text-lg font-semibold text-slate-900">
            Your journey so far
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {entries.length === 0
              ? 'Your entries will appear here after your first check-in.'
              : `${entries.length} check-in${entries.length === 1 ? '' : 's'} recorded`}
          </p>
        </div>
        {lastSevenMoods.length >= 2 && (
          <div className="min-w-[160px] rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Mood trend (last {Math.min(lastSevenMoods.length, SPARKLINE_WINDOW)} entries)
            </p>
            <svg
              viewBox="0 0 100 32"
              className="mt-1 h-10 w-full"
              role="img"
              aria-label={`Mood trend sparkline for last ${lastSevenMoods.length} entries`}
            >
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-wellness-600"
                points={sparklinePoints}
              />
            </svg>
            {avgMood && (
              <p className="text-xs text-slate-600">
                Average: <span className="font-semibold text-wellness-800">{avgMood}/10</span>
              </p>
            )}
          </div>
        )}
      </div>

      <div
        className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1"
        role="list"
        aria-label="Past journal entries"
      >
        {sortedEntries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No entries yet — your first reflection is just a few taps away.
          </p>
        ) : (
          sortedEntries.map((entry) => (
            <article
              key={entry.id}
              role="listitem"
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-wellness-200 hover:bg-wellness-50/50"
            >
              <header className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  {entry.exam && (
                    <span className="mr-2 text-xs font-semibold uppercase text-wellness-700">
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
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-wellness-800 ring-1 ring-wellness-200"
                  aria-label={`Mood ${entry.mood} out of 10`}
                >
                  <span aria-hidden="true">{MOOD_EMOJIS[entry.mood]}</span>
                  {entry.mood}/10
                </span>
              </header>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-800">{entry.journalText}</p>
              {entry.sections?.copingStrategies && (
                <p className="mt-2 text-xs text-slate-600">
                  <span className="font-semibold text-emerald-800">{SECTION_HEADINGS.coping}: </span>
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
