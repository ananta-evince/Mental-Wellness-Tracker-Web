import { lazy, Suspense, useCallback, useReducer } from 'react';
import AIInsights from './components/AIInsights';
import ExamSelector from './components/ExamSelector';
import JournalEntry from './components/JournalEntry';
import MindfulnessCard from './components/MindfulnessCard';
import MoodSelector from './components/MoodSelector';
import { useGemini } from './hooks/useGemini';
import { sanitiseInput } from './utils/sanitize';

const HistoryView = lazy(() => import('./components/HistoryView'));

const INITIAL_STATE = {
  selectedExam: 'NEET',
  journalText: '',
  selectedMood: null,
  journalError: null,
  moodError: null,
  entries: [],
  latestSections: null,
};

/**
 * @param {typeof INITIAL_STATE} state
 * @param {{ type: string, payload?: object }} action
 */
function journalReducer(state, action) {
  switch (action.type) {
    case 'SET_EXAM':
      return { ...state, selectedExam: action.payload.exam };
    case 'SET_JOURNAL':
      return {
        ...state,
        journalText: action.payload.text,
        journalError: action.payload.text.trim() ? null : state.journalError,
      };
    case 'SET_MOOD':
      return { ...state, selectedMood: action.payload.mood, moodError: null };
    case 'SET_JOURNAL_ERROR':
      return { ...state, journalError: action.payload.message };
    case 'SET_MOOD_ERROR':
      return { ...state, moodError: action.payload.message };
    case 'CLEAR_VALIDATION':
      return { ...state, journalError: null, moodError: null };
    case 'ADD_ENTRY':
      return {
        ...state,
        entries: [action.payload.entry, ...state.entries],
        latestSections: action.payload.sections,
        journalText: '',
        selectedMood: null,
        journalError: null,
        moodError: null,
      };
    default:
      return state;
  }
}

/**
 * @component
 * Root application — exam onboarding, journaling, mood logging, and AI wellness insights.
 */
export default function App() {
  const [state, dispatch] = useReducer(journalReducer, INITIAL_STATE);
  const { data, loading, error, call } = useGemini();

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      dispatch({ type: 'CLEAR_VALIDATION' });

      const sanitised = sanitiseInput(state.journalText);
      let hasError = false;

      if (!sanitised) {
        dispatch({
          type: 'SET_JOURNAL_ERROR',
          payload: { message: 'Please write at least a few words before submitting.' },
        });
        hasError = true;
      }

      if (state.selectedMood === null) {
        dispatch({
          type: 'SET_MOOD_ERROR',
          payload: { message: 'Please select how you are feeling on the mood scale.' },
        });
        hasError = true;
      }

      if (hasError) return;

      const result = await call({
        moodScore: state.selectedMood,
        journalText: sanitised,
        exam: state.selectedExam,
      });

      if (result) {
        dispatch({
          type: 'ADD_ENTRY',
          payload: {
            entry: {
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              journalText: sanitised,
              mood: state.selectedMood,
              exam: state.selectedExam,
              sections: result.sections,
            },
            sections: result.sections,
          },
        });
      }
    },
    [state.journalText, state.selectedMood, state.selectedExam, call]
  );

  const sections = state.latestSections ?? data?.sections ?? null;
  const mindfulnessContent = sections?.mindfulnessExercise ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-50 via-slate-50 to-calm-50">
      <nav aria-label="Primary" className="border-b border-wellness-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <a href="#main-heading" className="skip-link">
            Skip to main content
          </a>
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-wellness-100 text-xl"
              aria-hidden="true"
            >
              🌿
            </span>
            <span className="text-lg font-bold text-wellness-900">Wellness Tracker</span>
          </div>
          <span className="rounded-full bg-wellness-100 px-3 py-1 text-xs font-semibold text-wellness-800">
            {state.selectedExam}
          </span>
        </div>
      </nav>

      <header className="border-b border-wellness-100 bg-white/60" aria-labelledby="app-title">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
          <h1 id="app-title" className="text-xl font-bold tracking-tight text-wellness-900 sm:text-2xl">
            Mental Wellness Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            A gentle, AI-powered space for students under exam pressure — you&apos;re doing harder things than you think.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6" aria-labelledby="main-heading">
        <h2 id="main-heading" className="sr-only">
          Daily wellness check-in
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate aria-label="Daily wellness check-in form">
          <section
            aria-labelledby="onboarding-heading"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 id="onboarding-heading" className="text-lg font-semibold text-slate-900">
              Your exam journey
            </h3>
            <div className="mt-5">
              <ExamSelector
                selectedExam={state.selectedExam}
                onSelect={(exam) => dispatch({ type: 'SET_EXAM', payload: { exam } })}
                disabled={loading}
              />
            </div>
          </section>

          <section
            aria-labelledby="checkin-heading"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 id="checkin-heading" className="text-lg font-semibold text-slate-900">
              Today&apos;s check-in
            </h3>
            <div className="mt-5 space-y-6">
              <JournalEntry
                value={state.journalText}
                onChange={(text) => dispatch({ type: 'SET_JOURNAL', payload: { text } })}
                disabled={loading}
                validationError={state.journalError}
              />
              <MoodSelector
                selectedMood={state.selectedMood}
                onSelect={(mood) => dispatch({ type: 'SET_MOOD', payload: { mood } })}
                disabled={loading}
                validationError={state.moodError}
              />
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                aria-label="Submit journal entry for AI wellness analysis"
                aria-busy={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-wellness-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-wellness-700 focus:outline-none focus:ring-2 focus:ring-wellness-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? (
                  <>
                    <span
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    Analyzing…
                  </>
                ) : (
                  'Get wellness insights'
                )}
              </button>
            </div>
          </section>
        </form>

        <div className="mt-8 space-y-8">
          <AIInsights sections={sections} loading={loading} error={error} />
          <MindfulnessCard content={mindfulnessContent} loading={loading} />
          <Suspense
            fallback={
              <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                Loading history…
              </p>
            }
          >
            <HistoryView entries={state.entries} />
          </Suspense>
        </div>
      </main>

      <footer
        className="mt-12 border-t border-slate-200 bg-white/60 py-6 text-center text-xs text-slate-500"
        aria-labelledby="footer-note"
      >
        <p id="footer-note">
          This app supports reflection — it is not a substitute for professional mental health care.
          If you&apos;re in crisis, please reach out to a trusted adult or helpline.
        </p>
      </footer>
    </div>
  );
}
