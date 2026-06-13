import { SECTION_HEADINGS } from '../constants';

/**
 * @component
 * Displays the adaptive mindfulness exercise from Gemini insights.
 * @param {{ content: string | null, loading?: boolean }} props
 */
export default function MindfulnessCard({ content, loading = false }) {
  if (loading) {
    return (
      <section
        aria-labelledby="mindfulness-heading"
        aria-busy="true"
        className="rounded-2xl border border-calm-100 bg-calm-50 p-6 shadow-sm"
      >
        <h2 id="mindfulness-heading" className="text-lg font-semibold text-slate-900">
          {SECTION_HEADINGS.mindfulness}
        </h2>
        <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-calm-100 motion-reduce:animate-none" />
      </section>
    );
  }

  if (!content?.trim()) {
    return (
      <section
        aria-labelledby="mindfulness-heading"
        className="rounded-2xl border border-dashed border-calm-200 bg-calm-50/50 p-6"
      >
        <h2 id="mindfulness-heading" className="text-lg font-semibold text-slate-800">
          {SECTION_HEADINGS.mindfulness}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Complete a check-in to receive a breathing or focus exercise matched to your stress level.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="mindfulness-heading"
      className="rounded-2xl border border-calm-200 bg-calm-50 p-6 shadow-sm"
    >
      <h2 id="mindfulness-heading" className="text-lg font-semibold text-slate-900">
        {SECTION_HEADINGS.mindfulness}
      </h2>
      <div aria-live="polite" className="mt-3 rounded-xl border-l-4 border-l-calm-600 bg-white p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{content}</p>
      </div>
    </section>
  );
}
