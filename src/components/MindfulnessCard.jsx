import { memo } from 'react';
import PropTypes from 'prop-types';
import { SECTION_HEADINGS } from '../constants';

/**
 * @component MindfulnessCard
 * @description Displays the adaptive mindfulness exercise from Gemini insights
 * @param {Object} props
 * @param {string | null} props.content - mindfulness exercise text
 * @param {boolean} [props.loading] - whether AI analysis is in progress
 */
function MindfulnessCard({ content, loading = false }) {
  if (loading) {
    return (
      <section aria-labelledby="mindfulness-heading" aria-busy="true" className="surface-card">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-calm-100 motion-reduce:animate-none" aria-hidden="true">
            🧘
          </span>
          <h2 id="mindfulness-heading" className="section-title">
            {SECTION_HEADINGS.mindfulness}
          </h2>
        </div>
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-calm-50 motion-reduce:animate-none" />
      </section>
    );
  }

  if (!content?.trim()) {
    return (
      <section
        aria-labelledby="mindfulness-heading"
        className="surface-card border-dashed border-calm-200 bg-gradient-to-br from-calm-50/40 to-white"
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-calm-100 text-2xl"
            aria-hidden="true"
          >
            🧘
          </span>
          <div>
            <h2 id="mindfulness-heading" className="section-title">
              {SECTION_HEADINGS.mindfulness}
            </h2>
            <p className="mt-2 section-subtitle">
              Complete a check-in to receive a breathing or focus exercise matched to your stress level.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="mindfulness-heading"
      className="surface-card overflow-hidden border-calm-200 bg-gradient-to-br from-calm-50 via-white to-wellness-50/30"
    >
      <div className="flex items-start gap-4">
        <span
          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-calm-500 to-wellness-600 text-2xl shadow-md"
          aria-hidden="true"
        >
          <span className="absolute inset-0 animate-ping rounded-2xl bg-calm-400/20 motion-reduce:animate-none" />
          🧘
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="mindfulness-heading" className="section-title">
            {SECTION_HEADINGS.mindfulness}
          </h2>
          <div aria-live="polite" className="mt-4 rounded-xl border border-calm-100 bg-white/90 p-4 shadow-sm">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{content}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

MindfulnessCard.propTypes = {
  content: PropTypes.string,
  loading: PropTypes.bool,
};

export default memo(MindfulnessCard);
