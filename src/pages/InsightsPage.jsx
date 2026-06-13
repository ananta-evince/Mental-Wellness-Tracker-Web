import { memo } from 'react';
import PropTypes from 'prop-types';
import AIInsights from '../components/AIInsights';
import ErrorBoundary from '../components/ErrorBoundary';
import MindfulnessCard from '../components/MindfulnessCard';

const sectionsShape = PropTypes.shape({
  stressAnalysis: PropTypes.string,
  copingStrategies: PropTypes.string,
  mindfulnessExercise: PropTypes.string,
  motivationalMessage: PropTypes.string,
});

/**
 * @component InsightsPage
 * @description AI wellness insights and mindfulness exercise page
 * @param {Object} props
 * @param {object | null} props.sections - parsed AI insight sections
 * @param {boolean} props.loading - whether AI analysis is in progress
 * @param {string | null} props.error - error message from AI call
 * @param {string | null} props.mindfulnessContent - mindfulness exercise text
 * @param {string} props.selectedExam - currently selected exam name
 */
function InsightsPage({ sections, loading, error, mindfulnessContent, selectedExam }) {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-calm-600 text-sm font-bold text-white"
          aria-hidden="true"
        >
          3
        </span>
        <span className="sr-only">Step 3 of 4:</span>
        <div>
          <span className="section-badge">AI insights</span>
          <h2 id="insights-heading" className="mt-2 section-title">
            Your personalised support
          </h2>
          <p className="section-subtitle">
            Stress detection, coping strategies, and mindfulness — all matched to your mood and {selectedExam} prep.
          </p>
        </div>
      </div>

      <ErrorBoundary>
        <AIInsights sections={sections} loading={loading} error={error} />
      </ErrorBoundary>
      <MindfulnessCard content={mindfulnessContent} loading={loading} />
    </div>
  );
}

InsightsPage.propTypes = {
  sections: sectionsShape,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  mindfulnessContent: PropTypes.string,
  selectedExam: PropTypes.string.isRequired,
};

export default memo(InsightsPage);
