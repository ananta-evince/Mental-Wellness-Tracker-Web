import { SECTION_HEADINGS } from '../constants';

/**
 * @component
 * Displays parsed AI insight sections with loading and error states.
 * @param {{
 *   sections: { stressAnalysis?: string, copingStrategies?: string, motivationalMessage?: string } | null,
 *   loading: boolean,
 *   error: string | null
 * }} props
 */
export default function AIInsights({ sections, loading, error }) {
  if (loading) {
    return (
      <section
        aria-labelledby="ai-insights-heading"
        aria-busy="true"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 id="ai-insights-heading" className="text-lg font-semibold text-slate-900">
          Your wellness companion
        </h2>
        <div className="mt-4 flex items-center gap-3" role="status" aria-live="polite">
          <span
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-wellness-200 border-t-wellness-600 motion-reduce:animate-none"
            aria-hidden="true"
          />
          <p className="text-sm text-slate-600">
            Reading your entry with care — this usually takes a few seconds…
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        aria-labelledby="ai-insights-heading"
        className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm"
      >
        <h2 id="ai-insights-heading" className="text-lg font-semibold text-red-900">
          Something went wrong
        </h2>
        <p role="alert" aria-live="assertive" className="mt-2 text-sm text-red-800">
          {error}
        </p>
      </section>
    );
  }

  if (!sections) {
    return (
      <section
        aria-labelledby="ai-insights-heading"
        className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6"
      >
        <h2 id="ai-insights-heading" className="text-lg font-semibold text-slate-800">
          Your wellness companion
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Submit your journal and mood to receive personalised insights and coping tips.
        </p>
      </section>
    );
  }

  const insightBlocks = [
    {
      id: 'stress-analysis',
      title: SECTION_HEADINGS.stress,
      content: sections.stressAnalysis,
      accent: 'border-l-wellness-600 bg-wellness-50',
    },
    {
      id: 'coping-strategies',
      title: SECTION_HEADINGS.coping,
      content: sections.copingStrategies,
      accent: 'border-l-emerald-600 bg-emerald-50',
    },
    {
      id: 'motivational-message',
      title: 'A note for you',
      content: sections.motivationalMessage,
      accent: 'border-l-amber-500 bg-amber-50',
    },
  ].filter((block) => block.content?.trim());

  return (
    <section
      aria-labelledby="ai-insights-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 id="ai-insights-heading" className="text-lg font-semibold text-slate-900">
        Your wellness companion
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Here&apos;s what we noticed — take what helps, leave what doesn&apos;t.
      </p>
      <div className="mt-5 space-y-4" aria-live="polite" aria-atomic="true">
        {insightBlocks.map((block) => (
          <article
            key={block.id}
            aria-labelledby={`${block.id}-title`}
            className={`rounded-xl border-l-4 p-4 ${block.accent}`}
          >
            <h3 id={`${block.id}-title`} className="text-sm font-semibold text-slate-900">
              {block.title}
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {block.content}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
