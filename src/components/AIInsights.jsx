/**
 * Displays parsed AI insights with loading and error states.
 * @param {{
 *   sections: { stressAnalysis?: string, copingStrategies?: string, mindfulnessExercise?: string, motivationalMessage?: string } | null,
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
        <div className="mt-4 space-y-3" aria-hidden="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-slate-200 motion-reduce:animate-none"
              style={{ width: `${90 - i * 15}%` }}
            />
          ))}
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
          Submit your journal and mood to receive personalised insights, coping tips, and a mindfulness exercise.
        </p>
      </section>
    );
  }

  const insightBlocks = [
    {
      id: 'stress-analysis',
      title: 'Stress & emotional patterns',
      content: sections.stressAnalysis,
      icon: '🔍',
      accent: 'border-l-wellness-600 bg-wellness-50',
    },
    {
      id: 'coping-strategies',
      title: 'Coping strategies for you',
      content: sections.copingStrategies,
      icon: '🌱',
      accent: 'border-l-emerald-600 bg-emerald-50',
    },
    {
      id: 'mindfulness-exercise',
      title: 'Mindfulness exercise',
      content: sections.mindfulnessExercise,
      icon: '🧘',
      accent: 'border-l-calm-600 bg-calm-50',
    },
    {
      id: 'motivational-message',
      title: 'A note for you',
      content: sections.motivationalMessage,
      icon: '💛',
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
            <h3 id={`${block.id}-title`} className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span aria-hidden="true">{block.icon}</span>
              {block.title}
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{block.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
