import { useCallback } from 'react';
import { MOOD_EMOJIS, MOOD_LABELS } from '../constants';

const MOOD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Visual 1–10 mood scale with emoji indicators.
 * @param {{
 *   selectedMood: number | null,
 *   onSelect: (mood: number) => void,
 *   disabled?: boolean,
 *   validationError?: string | null
 * }} props
 */
export default function MoodSelector({
  selectedMood,
  onSelect,
  disabled = false,
  validationError = null,
}) {
  const handleKeyDown = useCallback(
    (event, mood) => {
      const index = MOOD_VALUES.indexOf(mood);
      let nextIndex = index;

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        nextIndex = Math.min(index + 1, MOOD_VALUES.length - 1);
        event.preventDefault();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        nextIndex = Math.max(index - 1, 0);
        event.preventDefault();
      } else if (event.key === 'Home') {
        nextIndex = 0;
        event.preventDefault();
      } else if (event.key === 'End') {
        nextIndex = MOOD_VALUES.length - 1;
        event.preventDefault();
      } else {
        return;
      }

      onSelect(MOOD_VALUES[nextIndex]);
      document.getElementById(`mood-btn-${MOOD_VALUES[nextIndex]}`)?.focus();
    },
    [onSelect]
  );

  return (
    <fieldset
      className="space-y-3"
      disabled={disabled}
      aria-describedby={validationError ? 'mood-error' : undefined}
      aria-invalid={validationError ? 'true' : 'false'}
    >
      <legend id="mood-legend" className="text-sm font-semibold text-slate-800">
        How are you feeling right now?
      </legend>
      <p className="text-sm text-slate-600">
        Select a mood from 1 (very low) to 10 (excellent). Use arrow keys to move between options.
      </p>
      <div
        className="grid grid-cols-5 gap-2 sm:grid-cols-10"
        role="group"
        aria-labelledby="mood-legend"
      >
        {MOOD_VALUES.map((mood) => {
          const isSelected = selectedMood === mood;
          return (
            <button
              key={mood}
              id={`mood-btn-${mood}`}
              type="button"
              aria-label={`Mood ${mood} of 10, ${MOOD_LABELS[mood]}`}
              aria-pressed={isSelected}
              disabled={disabled}
              tabIndex={selectedMood === null ? (mood === 5 ? 0 : -1) : isSelected ? 0 : -1}
              onClick={() => onSelect(mood)}
              onKeyDown={(event) => handleKeyDown(event, mood)}
              className={`flex flex-col items-center rounded-xl border-2 px-1 py-2 text-center transition focus:outline-none focus:ring-2 focus:ring-wellness-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? 'border-wellness-600 bg-wellness-100 shadow-md'
                  : 'border-slate-200 bg-white hover:border-wellness-300 hover:bg-wellness-50'
              }`}
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {MOOD_EMOJIS[mood]}
              </span>
              <span className="mt-1 text-xs font-semibold text-slate-700">{mood}</span>
            </button>
          );
        })}
      </div>
      {selectedMood !== null && (
        <p className="text-sm font-medium text-wellness-800" aria-live="polite">
          Selected: {MOOD_EMOJIS[selectedMood]} {MOOD_LABELS[selectedMood]} ({selectedMood}/10)
        </p>
      )}
      {validationError && (
        <p id="mood-error" role="alert" className="text-xs font-medium text-red-700">
          {validationError}
        </p>
      )}
    </fieldset>
  );
}

export { MOOD_VALUES };
