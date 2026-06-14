import { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import PageHeader from '../components/ui/PageHeader';

const INSIGHT_META = {
  emotional: { label: 'Emotional signals', icon: '💭', color: 'border-rose-500/20 bg-rose-500/5' },
  academic: { label: 'Academic signals', icon: '📚', color: 'border-amber-500/20 bg-amber-500/5' },
  environmental: { label: 'Environmental signals', icon: '🌍', color: 'border-emerald-500/20 bg-emerald-500/5' },
};

function JournalPage({ journals, onSave, onAnalyze, loading }) {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const entry = { text: text.trim(), date: new Date().toISOString() };
    onSave(entry);
    const result = await onAnalyze(text.trim());
    if (result) setAnalysis(result);
    setText('');
  }, [text, onSave, onAnalyze]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Journal" subtitle="Express yourself freely — no judgment here" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="input-field min-h-[180px] resize-y leading-relaxed"
          placeholder="What's on your mind today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Journal entry"
        />
        <button type="submit" disabled={loading || !text.trim()} className="btn-primary w-full" aria-busy={loading}>
          {loading ? 'Analyzing…' : 'Save & Get AI Insights'}
        </button>
      </form>

      {analysis && (
        <div className="glass-card space-y-3" role="region" aria-label="AI insights">
          <h2 className="text-base font-semibold text-amber-400 sm:text-lg">AI Insights</h2>
          {['emotional', 'academic', 'environmental'].map((key) => (
            analysis[key] && (
              <div key={key} className={`insight-card border ${INSIGHT_META[key].color}`}>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <span aria-hidden="true">{INSIGHT_META[key].icon}</span>
                  {INSIGHT_META[key].label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{analysis[key]}</p>
              </div>
            )
          ))}
        </div>
      )}

      {journals.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-white sm:text-lg">Recent Entries</h2>
          {journals.slice(0, 5).map((j) => (
            <article key={j.id || j.date} className="glass-card !p-4">
              <time className="text-xs text-slate-500">{new Date(j.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</time>
              <p className="mt-2 text-sm leading-relaxed text-slate-300 line-clamp-4">{j.text}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

JournalPage.propTypes = {
  journals: PropTypes.array.isRequired,
  onSave: PropTypes.func.isRequired,
  onAnalyze: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default memo(JournalPage);
