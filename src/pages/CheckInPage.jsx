import { memo } from 'react';
import PropTypes from 'prop-types';
import JournalEntry from '../components/JournalEntry';
import MoodSelector from '../components/MoodSelector';

/**
 * @component CheckInPage
 * @description Daily journal and mood check-in page
 * @param {Object} props
 * @param {string} props.journalText - current journal text
 * @param {Function} props.onJournalChange - callback when journal text changes
 * @param {number | null} props.selectedMood - currently selected mood score
 * @param {Function} props.onMoodSelect - callback when mood is selected
 * @param {string | null} props.journalError - journal validation message
 * @param {string | null} props.moodError - mood validation message
 * @param {boolean} props.loading - disables inputs while AI is processing
 * @param {Function} props.onSubmit - form submit handler
 */
function CheckInPage({
  journalText,
  onJournalChange,
  selectedMood,
  onMoodSelect,
  journalError,
  moodError,
  loading,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate aria-label="Daily wellness check-in form">
      <section aria-labelledby="checkin-heading" className="surface-card">
        <div className="flex items-start gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wellness-600 text-sm font-bold text-white"
            aria-hidden="true"
          >
            2
          </span>
          <span className="sr-only">Step 2 of 4:</span>
          <div>
            <span className="section-badge">Daily check-in</span>
            <h2 id="checkin-heading" className="mt-2 section-title">
              Today&apos;s check-in
            </h2>
            <p className="section-subtitle">
              Share how preparation feels today — no judgment, just honest reflection.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-6">
          <JournalEntry
            value={journalText}
            onChange={onJournalChange}
            disabled={loading}
            validationError={journalError}
          />
          <MoodSelector
            selectedMood={selectedMood}
            onSelect={onMoodSelect}
            disabled={loading}
            validationError={moodError}
          />
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Powered by Gemini AI · Your data stays in this session only
          </p>
          <button
            type="submit"
            disabled={loading}
            aria-label="Submit journal entry for AI wellness analysis"
            aria-busy={loading}
            className="btn-primary w-full sm:w-auto"
          >
            {loading ? (
              <>
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Analyzing your entry…
              </>
            ) : (
              <>✨ Get wellness insights</>
            )}
          </button>
        </div>
      </section>
    </form>
  );
}

CheckInPage.propTypes = {
  journalText: PropTypes.string.isRequired,
  onJournalChange: PropTypes.func.isRequired,
  selectedMood: PropTypes.number,
  onMoodSelect: PropTypes.func.isRequired,
  journalError: PropTypes.string,
  moodError: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default memo(CheckInPage);
