import { MAX_JOURNAL_LENGTH } from '../constants';
import { sanitizeText } from '../utils/sanitize';

/**
 * Daily journaling textarea with validation feedback.
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   disabled?: boolean,
 *   validationError?: string | null
 * }} props
 */
export default function JournalEntry({ value, onChange, disabled = false, validationError = null }) {
  const charCount = value.length;
  const isNearLimit = charCount >= MAX_JOURNAL_LENGTH * 0.9;
  const describedBy = validationError
    ? 'journal-hint journal-char-count journal-error'
    : 'journal-hint journal-char-count';

  const handleChange = (event) => {
    const next = sanitizeText(event.target.value);
    onChange(next.length <= MAX_JOURNAL_LENGTH ? next : next.slice(0, MAX_JOURNAL_LENGTH));
  };

  return (
    <div className="space-y-2">
      <label id="journal-label" htmlFor="journal-entry" className="block text-sm font-semibold text-slate-800">
        Today&apos;s journal
      </label>
      <p id="journal-hint" className="text-sm text-slate-600">
        Write freely about your day, worries, wins, or anything on your mind before the exam.
      </p>
      <textarea
        id="journal-entry"
        aria-labelledby="journal-label"
        aria-describedby={describedBy}
        aria-invalid={validationError ? 'true' : 'false'}
        className="min-h-[160px] w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-wellness-500 focus:outline-none focus:ring-2 focus:ring-wellness-200 disabled:cursor-not-allowed disabled:bg-slate-100"
        placeholder="How are you feeling about your preparation today?"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        maxLength={MAX_JOURNAL_LENGTH}
      />
      <div className="flex items-start justify-between gap-2">
        <span
          id="journal-char-count"
          className={`text-xs ${isNearLimit ? 'font-medium text-amber-700' : 'text-slate-500'}`}
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
