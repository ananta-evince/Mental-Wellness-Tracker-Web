import { memo } from 'react';
import PropTypes from 'prop-types';
import ExamSelector from '../components/ExamSelector';

/**
 * @component ExamJourneyPage
 * @description Onboarding page for selecting the target exam
 * @param {Object} props
 * @param {string} props.selectedExam - currently selected exam name
 * @param {Function} props.onSelect - callback when an exam is selected
 * @param {boolean} props.disabled - disables exam selection
 */
function ExamJourneyPage({ selectedExam, onSelect, disabled }) {
  return (
    <section aria-labelledby="onboarding-heading" className="surface-card">
      <div className="flex items-start gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wellness-600 text-sm font-bold text-white"
          aria-hidden="true"
        >
          1
        </span>
        <span className="sr-only">Step 1 of 4:</span>
        <div>
          <span className="section-badge">Onboarding</span>
          <h2 id="onboarding-heading" className="mt-2 section-title">
            Your exam journey
          </h2>
          <p className="section-subtitle">
            Which high-stakes exam are you preparing for? We&apos;ll tailor every insight to your path.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <ExamSelector selectedExam={selectedExam} onSelect={onSelect} disabled={disabled} />
      </div>
    </section>
  );
}

ExamJourneyPage.propTypes = {
  selectedExam: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default memo(ExamJourneyPage);
