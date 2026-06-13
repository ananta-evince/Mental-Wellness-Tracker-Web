import { useCallback } from 'react';
import { MOOD_EMOJIS, MOOD_LABELS } from '../constants';

const MOOD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * @component
 * Visual 1–10 mood scale with emoji indicators and accessible range slider.
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

  const sliderValue = selectedMood ?? 5;

  return (
    <fieldset
      className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50/80 to-white p-4 sm:p-5"
      disabled={disabled}
      aria-describedby={validationError ? 'mood-error' : undefined}
      aria-invalid={validationError ? 'true' : 'false'}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-calm-100 text-base"
          aria-hidden="true"
        >
          💭
        </span>
        <legend id="mood-legend" className="text-sm font-semibold text-slate-900">
          How are you feeling right now?
        </legend>
      </div>
      <p className="mb-4 text-sm text-slate-600">
        Select a mood from 1 (very low) to 10 (excellent).
      </p>

      <div className="mb-5 rounded-xl border border-slate-100 bg-white px-4 py-4">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="mood-slider" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Mood slider
          </label>
          <span className="rounded-full bg-wellness-100 px-2.5 py-0.5 text-xs font-bold text-wellness-800">
            {sliderValue}/10
          </span>
        </div>
        <input
          id="mood-slider"
          type="range"
          min="1"
          max="10"
          step="1"
          value={sliderValue}
          disabled={disabled}
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={sliderValue}
          aria-label="Mood slider from 1 to 10"
          onChange={(event) => onSelect(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-red-200 via-amber-200 to-emerald-300 accent-wellness-600 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-wellness-600 [&::-webkit-slider-thumb]:shadow-md"
        />
        <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

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
              aria-label={`Mood ${mood} out of 10`}
              aria-pressed={isSelected}
              disabled={disabled}
              tabIndex={selectedMood === null ? (mood === 5 ? 0 : -1) : isSelected ? 0 : -1}
              onClick={() => onSelect(mood)}
              onKeyDown={(event) => handleKeyDown(event, mood)}
              className={`flex flex-col items-center rounded-xl border-2 px-1 py-2.5 text-center transition focus:outline-none focus:ring-2 focus:ring-wellness-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? 'scale-105 border-wellness-500 bg-wellness-50 shadow-md ring-2 ring-wellness-200'
                  : 'border-slate-200 bg-white hover:border-wellness-300 hover:bg-wellness-50/50'
              }`}
            >
              <span className="text-xl leading-none sm:text-2xl" aria-hidden="true">
                {MOOD_EMOJIS[mood]}
              </span>
              <span className="mt-1 text-[10px] font-bold text-slate-600 sm:text-xs">{mood}</span>
            </button>
          );
        })}
      </div>

      {selectedMood !== null && (
        <p
          className="mt-4 rounded-xl bg-wellness-50 px-3 py-2 text-center text-sm font-medium text-wellness-900"
          aria-live="polite"
        >
          {MOOD_EMOJIS[selectedMood]} {MOOD_LABELS[selectedMood]} — {selectedMood}/10
        </p>
      )}
      {validationError && (
        <p id="mood-error" role="alert" className="mt-2 text-xs font-medium text-red-700">
          {validationError}
        </p>
      )}
    </fieldset>
  );
}

export { MOOD_VALUES };
