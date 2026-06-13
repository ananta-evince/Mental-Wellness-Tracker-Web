import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { SECTION_HEADINGS } from '../constants';

const BLOCK_STYLES = {
  stress: {
    icon: '🔍',
    accent: 'from-wellness-500 to-wellness-600',
    bg: 'border-wellness-100 bg-gradient-to-br from-wellness-50 to-white',
  },
  coping: {
    icon: '🌱',
    accent: 'from-emerald-500 to-teal-600',
    bg: 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-white',
  },
  motivation: {
    icon: '💛',
    accent: 'from-amber-400 to-orange-500',
    bg: 'border-amber-100 bg-gradient-to-br from-warm-50 to-white',
  },
};

const sectionsShape = PropTypes.shape({
  stressAnalysis: PropTypes.string,
  copingStrategies: PropTypes.string,
  motivationalMessage: PropTypes.string,
});

/**
 * Builds filtered insight blocks from parsed AI sections.
 * @param {object} sections
 * @returns {Array<{ id: string, key: string, title: string, content: string }>}
 */
function buildInsightBlocks(sections) {
  return [
    { id: 'stress-analysis', key: 'stress', title: SECTION_HEADINGS.stress, content: sections.stressAnalysis },
    { id: 'coping-strategies', key: 'coping', title: SECTION_HEADINGS.coping, content: sections.copingStrategies },
    {
      id: 'motivational-message',
      key: 'motivation',
      title: 'A note for you',
      content: sections.motivationalMessage,
    },
  ].filter((block) => block.content?.trim());
}

/**
 * @component AIInsightsLoading
 * @description Loading state for AI wellness insights
 */
const AIInsightsLoading = memo(function AIInsightsLoading() {
  return (
    <section aria-labelledby="ai-insights-heading" aria-busy="true" className="surface-card">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-wellness-100 text-lg" aria-hidden="true">
          ✨
        </span>
        <h2 id="ai-insights-heading" className="section-title">
          Your wellness companion
        </h2>
      </div>
      <div className="mt-6 flex items-center gap-4 rounded-xl bg-slate-50 p-4" role="status" aria-live="polite">
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
});

/**
 * @component AIInsightsError
 * @description Error state for AI wellness insights
 * @param {Object} props
 * @param {string} props.error - error message to display
 */
const AIInsightsError = memo(function AIInsightsError({ error }) {
  return (
    <section
      aria-labelledby="ai-insights-heading"
      className="surface-card border-red-200 bg-gradient-to-br from-red-50 to-white"
    >
      <h2 id="ai-insights-heading" className="text-lg font-semibold text-red-900">
        Something went wrong
      </h2>
      <p role="alert" aria-live="assertive" className="mt-3 rounded-xl bg-white/80 p-4 text-sm text-red-800">
        {error}
      </p>
    </section>
  );
});

AIInsightsError.propTypes = {
  error: PropTypes.string.isRequired,
};

/**
 * @component AIInsightsEmpty
 * @description Empty state prompting the user to submit a check-in
 */
const AIInsightsEmpty = memo(function AIInsightsEmpty() {
  return (
    <section
      aria-labelledby="ai-insights-heading"
      className="surface-card border-dashed border-slate-200 bg-slate-50/50"
    >
      <div className="flex flex-col items-center py-6 text-center">
        <span className="text-4xl" aria-hidden="true">
          🌱
        </span>
        <h2 id="ai-insights-heading" className="mt-3 section-title">
          Your wellness companion
        </h2>
        <p className="mt-2 max-w-md section-subtitle">
          Submit your journal and mood to unlock AI-powered stress insights and personalised coping strategies.
        </p>
      </div>
    </section>
  );
});

/**
 * @component AIInsightsContent
 * @description Renders parsed AI insight sections
 * @param {Object} props
 * @param {object} props.sections - parsed insight sections
 */
const AIInsightsContent = memo(function AIInsightsContent({ sections }) {
  const insightBlocks = useMemo(() => buildInsightBlocks(sections), [sections]);

  return (
    <section aria-labelledby="ai-insights-heading" className="surface-card">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wellness-100 text-lg" aria-hidden="true">
          ✨
        </span>
        <div>
          <h2 id="ai-insights-heading" className="section-title">
            Your wellness companion
          </h2>
          <p className="section-subtitle">
            Here&apos;s what we noticed — take what helps, leave what doesn&apos;t.
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-4" aria-live="polite" aria-atomic="true">
        {insightBlocks.map((block) => {
          const style = BLOCK_STYLES[block.key];
          return (
            <article
              key={block.id}
              aria-labelledby={`${block.id}-title`}
              className={`insight-panel border ${style.bg}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${style.accent} text-sm text-white shadow-sm`}
                  aria-hidden="true"
                >
                  {style.icon}
                </span>
                <h3 id={`${block.id}-title`} className="text-sm font-bold text-slate-900">
                  {block.title}
                </h3>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {block.content}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
});

AIInsightsContent.propTypes = {
  sections: sectionsShape.isRequired,
};

/**
 * @component AIInsights
 * @description Displays parsed AI insight sections with loading and error states
 * @param {Object} props
 * @param {object | null} props.sections - parsed insight sections
 * @param {boolean} props.loading - whether AI analysis is in progress
 * @param {string | null} props.error - error message from AI call
 */
function AIInsights({ sections, loading, error }) {
  if (loading) return <AIInsightsLoading />;
  if (error) return <AIInsightsError error={error} />;
  if (!sections) return <AIInsightsEmpty />;
  return <AIInsightsContent sections={sections} />;
}

AIInsights.propTypes = {
  sections: sectionsShape,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default memo(AIInsights);
