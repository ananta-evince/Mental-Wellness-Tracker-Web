import { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import PageHeader from '../components/ui/PageHeader';
import { CHECKIN_METRICS, MAX_MOOD, MIN_MOOD } from '../constants';

const DEFAULT_METRICS = {
  energy: 5, stress: 5, confidence: 5, sleepQuality: 5, studySatisfaction: 5,
};

function CheckInPage({ onSubmit, loading }) {
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((id, value) => {
    setMetrics((prev) => ({ ...prev, [id]: Number(value) }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const ok = await onSubmit(metrics);
    if (ok) setSubmitted(true);
  }, [metrics, onSubmit]);

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8 text-center sm:py-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 text-4xl" aria-hidden="true">🌟</div>
        <h2 className="text-2xl font-bold text-amber-400 aurora-text-glow">Thank you for checking in</h2>
        <p className="text-sm leading-relaxed text-slate-400">Remember, every day you show up for yourself is a victory.</p>
        <button type="button" onClick={() => setSubmitted(false)} className="btn-ghost w-full sm:w-auto">Check in again</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Daily Check-in" subtitle="How are you feeling today?" />

      <form onSubmit={handleSubmit} className="space-y-3 pb-20 md:pb-0">
        {CHECKIN_METRICS.map(({ id, label, emoji }) => (
          <div key={id} className="metric-card">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-lg" aria-hidden="true">{emoji}</span>
                <span className="text-sm font-semibold text-white">{label}</span>
              </div>
              <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-sm font-bold tabular-nums text-amber-400">
                {metrics[id]}/{MAX_MOOD}
              </span>
            </div>
            <input
              type="range"
              min={MIN_MOOD}
              max={MAX_MOOD}
              value={metrics[id]}
              onChange={(e) => handleChange(id, e.target.value)}
              className="metric-slider metric-slider-track"
              aria-label={`${label} slider`}
            />
            <div className="mt-1.5 flex justify-between text-[10px] text-slate-600">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        ))}

        <div className="sticky-mobile-cta md:mt-2">
          <button type="submit" disabled={loading} className="btn-primary w-full" aria-busy={loading}>
            {loading ? 'Saving…' : 'Submit daily check-in'}
          </button>
        </div>
      </form>
    </div>
  );
}

CheckInPage.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default memo(CheckInPage);
