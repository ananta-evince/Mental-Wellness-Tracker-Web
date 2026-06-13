import { lazy, Suspense, useCallback, useMemo, useReducer } from 'react';
import AIInsights from './components/AIInsights';
import ErrorBoundary from './components/ErrorBoundary';
import ExamSelector from './components/ExamSelector';
import JournalEntry from './components/JournalEntry';
import MindfulnessCard from './components/MindfulnessCard';
import MoodSelector from './components/MoodSelector';
import { EXAM_META, FEATURE_PILLS } from './constants';
import { useGemini } from './hooks/useGemini';
import { validateCheckInFields } from './utils/validation';

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
 * @returns {typeof INITIAL_STATE}
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
 * Dispatches validation errors from check-in field validation.
 * @param {Function} dispatch
 * @param {{ journalError: string | null, moodError: string | null }} validation
 */
function dispatchValidationErrors(dispatch, validation) {
  if (validation.journalError) {
    dispatch({ type: 'SET_JOURNAL_ERROR', payload: { message: validation.journalError } });
  }
  if (validation.moodError) {
    dispatch({ type: 'SET_MOOD_ERROR', payload: { message: validation.moodError } });
  }
}

/**
 * @component App
 * @description Root application — exam onboarding, journaling, mood logging, and AI wellness insights
 */
export default function App() {
  const [state, dispatch] = useReducer(journalReducer, INITIAL_STATE);
  const { data, loading, error, call } = useGemini();
  const examMeta = EXAM_META[state.selectedExam];

  const handleExamSelect = useCallback((exam) => {
    dispatch({ type: 'SET_EXAM', payload: { exam } });
  }, []);

  const handleJournalChange = useCallback((text) => {
    dispatch({ type: 'SET_JOURNAL', payload: { text } });
  }, []);

  const handleMoodSelect = useCallback((mood) => {
    dispatch({ type: 'SET_MOOD', payload: { mood } });
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      dispatch({ type: 'CLEAR_VALIDATION' });

      const validation = validateCheckInFields(state.journalText, state.selectedMood);
      if (!validation.isValid) {
        dispatchValidationErrors(dispatch, validation);
        return;
      }

      const result = await call({
        moodScore: state.selectedMood,
        journalText: validation.sanitised,
        exam: state.selectedExam,
      });

      if (result) {
        dispatch({
          type: 'ADD_ENTRY',
          payload: {
            entry: {
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              journalText: validation.sanitised,
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

  const sections = useMemo(
    () => state.latestSections ?? data?.sections ?? null,
    [state.latestSections, data?.sections]
  );

  const mindfulnessContent = useMemo(
    () => sections?.mindfulnessExercise ?? null,
    [sections]
  );

  return (
    <div className="page-shell">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-wellness-200/30 blur-3xl" />
        <div className="absolute -right-16 top-40 h-64 w-64 rounded-full bg-calm-200/25 blur-3xl" />
      </div>

      <nav
        aria-label="Primary"
        className="sticky top-0 z-40 border-b border-white/60 bg-white/85 shadow-nav backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a href="#main-heading" className="skip-link">
            Skip to main content
          </a>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-wellness-500 to-wellness-700 text-lg shadow-sm">
              🌿
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Wellness Tracker</p>
              <p className="text-[11px] text-slate-500">AI companion for exam prep</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 sm:inline">Preparing for</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-wellness-100 px-3 py-1.5 text-xs font-bold text-wellness-800 ring-1 ring-wellness-200">
              <span aria-hidden="true">{examMeta.emoji}</span>
              {state.selectedExam}
            </span>
          </div>
        </div>
      </nav>

      <header className="relative border-b border-wellness-100/60" aria-labelledby="app-title">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <span className="section-badge">Built for Indian students</span>
          <h1 id="app-title" className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Mental Wellness{' '}
            <span className="text-gradient">Tracker</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            A gentle, AI-powered space for students under exam pressure. Journal your thoughts, track your mood,
            and receive personalised wellness support tailored to your {state.selectedExam} journey.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {FEATURE_PILLS.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="main-heading">
        <h2 id="main-heading" className="sr-only">
          Daily wellness check-in
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate aria-label="Daily wellness check-in form">
          <section aria-labelledby="onboarding-heading" className="surface-card">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wellness-600 text-sm font-bold text-white">
                1
              </span>
              <div>
                <span className="section-badge">Onboarding</span>
                <h3 id="onboarding-heading" className="mt-2 section-title">
                  Your exam journey
                </h3>
                <p className="section-subtitle">
                  Which high-stakes exam are you preparing for? We&apos;ll tailor every insight to your path.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <ExamSelector
                selectedExam={state.selectedExam}
                onSelect={handleExamSelect}
                disabled={loading}
              />
            </div>
          </section>

          <section aria-labelledby="checkin-heading" className="surface-card">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wellness-600 text-sm font-bold text-white">
                2
              </span>
              <div>
                <span className="section-badge">Daily check-in</span>
                <h3 id="checkin-heading" className="mt-2 section-title">
                  Today&apos;s check-in
                </h3>
                <p className="section-subtitle">
                  Share how preparation feels today — no judgment, just honest reflection.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-6">
              <JournalEntry
                value={state.journalText}
                onChange={handleJournalChange}
                disabled={loading}
                validationError={state.journalError}
              />
              <MoodSelector
                selectedMood={state.selectedMood}
                onSelect={handleMoodSelect}
                disabled={loading}
                validationError={state.moodError}
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

        <div className="mt-12 space-y-8">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-calm-600 text-sm font-bold text-white">
              3
            </span>
            <div>
              <span className="section-badge">AI insights</span>
              <h3 className="mt-2 section-title">Your personalised support</h3>
              <p className="section-subtitle">
                Stress detection, coping strategies, and mindfulness — all matched to your mood and {state.selectedExam} prep.
              </p>
            </div>
          </div>

          <ErrorBoundary>
            <AIInsights sections={sections} loading={loading} error={error} />
          </ErrorBoundary>
          <MindfulnessCard content={mindfulnessContent} loading={loading} />

          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="surface-card animate-pulse motion-reduce:animate-none">
                  <p className="text-sm text-slate-500">Loading history…</p>
                </div>
              }
            >
              <HistoryView entries={state.entries} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>

      <footer
        className="relative mt-16 border-t border-slate-200/80 bg-white/70 py-10 backdrop-blur-sm"
        aria-labelledby="footer-note"
      >
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-slate-800">You matter beyond any score.</p>
          <p id="footer-note" className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-slate-500">
            This app supports reflection — it is not a substitute for professional mental health care.
            If you&apos;re in crisis, please reach out to a trusted adult or helpline.
          </p>
        </div>
      </footer>
    </div>
  );
}
