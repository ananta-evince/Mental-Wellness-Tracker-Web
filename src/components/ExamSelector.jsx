import { EXAMS, EXAM_META } from '../constants';

/**
 * @component
 * Exam selector for onboarding — NEET, JEE, CUET, CAT, GATE, UPSC.
 * @param {{ selectedExam: string, onSelect: (exam: string) => void, disabled?: boolean }} props
 */
export default function ExamSelector({ selectedExam, onSelect, disabled = false }) {
  return (
    <fieldset className="space-y-4" disabled={disabled}>
      <legend id="exam-legend" className="sr-only">
        Which exam are you preparing for?
      </legend>
      <p id="exam-hint" className="text-sm text-slate-600">
        Pick your exam — every insight, tip, and exercise will speak directly to your preparation journey.
      </p>
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        role="radiogroup"
        aria-labelledby="exam-legend"
        aria-describedby="exam-hint"
      >
        {EXAMS.map((exam) => {
          const isSelected = selectedExam === exam;
          const meta = EXAM_META[exam];

          return (
            <label
              key={exam}
              htmlFor={`exam-${exam}`}
              className={`group relative flex cursor-pointer flex-col rounded-2xl border-2 p-4 transition focus-within:ring-2 focus-within:ring-wellness-500 focus-within:ring-offset-2 ${
                isSelected
                  ? 'border-wellness-500 bg-gradient-to-br from-wellness-50 to-white shadow-card ring-1 ring-wellness-200'
                  : 'border-slate-200 bg-white hover:border-wellness-300 hover:shadow-sm'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <input
                id={`exam-${exam}`}
                type="radio"
                name="exam"
                value={exam}
                checked={isSelected}
                disabled={disabled}
                aria-label={exam}
                onChange={() => onSelect(exam)}
                className="sr-only"
              />
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl" aria-hidden="true">
                  {meta.emoji}
                </span>
                {isSelected && (
                  <span className="rounded-full bg-wellness-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Active
                  </span>
                )}
              </div>
              <span className="mt-3 text-base font-bold text-slate-900">{exam}</span>
              <span className="mt-0.5 text-xs text-slate-500">{meta.tagline}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
