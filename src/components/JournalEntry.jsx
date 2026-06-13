import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CHAR_LIMIT_WARNING_RATIO, MAX_JOURNAL_LENGTH } from '../constants';

/**
 * @component JournalEntry
 * @description Renders the daily journal input form
 * @param {Object} props
 * @param {string} props.value - current journal text
 * @param {Function} props.onChange - callback when journal text changes
 * @param {boolean} [props.disabled] - disables the textarea
 * @param {string | null} [props.validationError] - validation message to display
 */
function JournalEntry({ value, onChange, disabled = false, validationError = null }) {
  const charCount = value.length;
  const isNearLimit = charCount >= MAX_JOURNAL_LENGTH * CHAR_LIMIT_WARNING_RATIO;
  const describedBy = validationError
    ? 'journal-hint journal-char-count journal-error'
    : 'journal-hint journal-char-count';

  const handleChange = useCallback(
    (event) => {
      onChange(event.target.value.slice(0, MAX_JOURNAL_LENGTH));
    },
    [onChange]
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50/80 to-white p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-wellness-100 text-base"
          aria-hidden="true"
        >
          ✍️
        </span>
        <label id="journal-label" htmlFor="journal-entry" className="text-sm font-semibold text-slate-900">
          Today&apos;s journal
        </label>
      </div>
      <p id="journal-hint" className="mb-3 text-sm leading-relaxed text-slate-600">
        Write freely about your day, worries, wins, or anything on your mind before the exam.
      </p>
      <textarea
        id="journal-entry"
        aria-labelledby="journal-label"
        aria-describedby={describedBy}
        aria-invalid={validationError ? 'true' : 'false'}
        className="input-field min-h-[180px] resize-y leading-relaxed"
        placeholder="How are you feeling about your preparation today?"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        maxLength={MAX_JOURNAL_LENGTH}
      />
      <div className="mt-2 flex items-start justify-between gap-2">
        <span
          id="journal-char-count"
          className={`text-xs ${isNearLimit ? 'font-semibold text-amber-700' : 'text-slate-500'}`}
        >
          {charCount} / {MAX_JOURNAL_LENGTH} characters
        </span>
        {validationError && (
          <p id="journal-error" role="alert" className="text-right text-xs font-medium text-red-700">
            {validationError}
          </p>
        )}
      </div>
    </div>
  );
}

JournalEntry.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  validationError: PropTypes.string,
};

export default memo(JournalEntry);
