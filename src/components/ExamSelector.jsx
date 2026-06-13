import { EXAMS } from '../constants';

/**
 * @component
 * Exam selector for onboarding — NEET, JEE, CUET, CAT, GATE, UPSC.
 * @param {{ selectedExam: string, onSelect: (exam: string) => void, disabled?: boolean }} props
 */
export default function ExamSelector({ selectedExam, onSelect, disabled = false }) {
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend id="exam-legend" className="text-sm font-semibold text-slate-800">
        Which exam are you preparing for?
      </legend>
      <p id="exam-hint" className="text-sm text-slate-600">
        Your wellness companion will tailor insights to your exam journey.
      </p>
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        role="radiogroup"
        aria-labelledby="exam-legend"
        aria-describedby="exam-hint"
      >
        {EXAMS.map((exam) => {
          const isSelected = selectedExam === exam;
          return (
            <label
              key={exam}
              htmlFor={`exam-${exam}`}
              className={`flex cursor-pointer items-center justify-center rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition focus-within:ring-2 focus-within:ring-wellness-500 focus-within:ring-offset-2 ${
                isSelected
                  ? 'border-wellness-600 bg-wellness-100 text-wellness-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-wellness-300'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <input
                id={`exam-${exam}`}
                type="radio"
                name="exam"
                value={exam}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onSelect(exam)}
                className="sr-only"
              />
              {exam}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
