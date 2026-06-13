import { useCallback, useMemo, useReducer, useState, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import { APP_PAGES, EXAM_META, FEATURE_PILLS } from './constants';
import { useGemini } from './hooks/useGemini';
import { usePageFocus } from './hooks/useFocusTrap';
import { isValidExam, validateCheckInFields } from './utils/validation';

const CheckInPage = lazy(() => import('./pages/CheckInPage'));
const ExamJourneyPage = lazy(() => import('./pages/ExamJourneyPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));

const pageFallback = (
  <div className="surface-card animate-pulse motion-reduce:animate-none" role="status" aria-live="polite">
    <p className="text-sm text-slate-500">Loading page…</p>
  </div>
);

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
      return isValidExam(action.payload.exam)
        ? { ...state, selectedExam: action.payload.exam }
        : state;
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
  const [activePage, setActivePage] = useState(APP_PAGES.EXAM_JOURNEY);
  const { data, loading, error, call } = useGemini();
  const examMeta = EXAM_META[state.selectedExam];

  usePageFocus(activePage);

  const handleNavigate = useCallback((pageId) => {
    setActivePage(pageId);
  }, []);

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
        setActivePage(APP_PAGES.INSIGHTS);
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

  const pageContent = useMemo(() => {
    switch (activePage) {
      case APP_PAGES.CHECK_IN:
        return (
          <CheckInPage
            journalText={state.journalText}
            onJournalChange={handleJournalChange}
            selectedMood={state.selectedMood}
            onMoodSelect={handleMoodSelect}
            journalError={state.journalError}
            moodError={state.moodError}
            loading={loading}
            onSubmit={handleSubmit}
          />
        );
      case APP_PAGES.INSIGHTS:
        return (
          <InsightsPage
            sections={sections}
            loading={loading}
            error={error}
            mindfulnessContent={mindfulnessContent}
            selectedExam={state.selectedExam}
          />
        );
      case APP_PAGES.HISTORY:
        return <HistoryPage entries={state.entries} />;
      case APP_PAGES.EXAM_JOURNEY:
      default:
        return (
          <ExamJourneyPage
            selectedExam={state.selectedExam}
            onSelect={handleExamSelect}
            disabled={loading}
          />
        );
    }
  }, [
    activePage,
    state.journalText,
    state.selectedMood,
    state.journalError,
    state.moodError,
    state.selectedExam,
    state.entries,
    handleJournalChange,
    handleMoodSelect,
    handleSubmit,
    handleExamSelect,
    loading,
    sections,
    error,
    mindfulnessContent,
  ]);

  return (
    <div className="page-shell">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-wellness-200/30 blur-3xl" />
        <div className="absolute -right-16 top-40 h-64 w-64 rounded-full bg-calm-200/25 blur-3xl" />
      </div>

      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        selectedExam={state.selectedExam}
        examEmoji={examMeta.emoji}
        entryCount={state.entries.length}
      />

      <div className="main-content-shell">
        <a href="#main-heading" className="skip-link">
          Skip to main content
        </a>

        <header className="hero-compact" aria-labelledby="app-title">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <span className="section-badge">Built for Indian students</span>
            <h1 id="app-title" className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Mental Wellness{' '}
              <span className="text-gradient">Tracker</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
              A gentle, AI-powered space for students under exam pressure. Journal your thoughts, track your mood,
              and receive personalised wellness support tailored to your {state.selectedExam} journey.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
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

        <main
          className="relative mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8"
          aria-labelledby="main-heading"
        >
          <h2 id="main-heading" tabIndex={-1} className="sr-only outline-none">
            Daily wellness check-in
          </h2>
          <Suspense fallback={pageFallback}>{pageContent}</Suspense>
        </main>

        <footer
          className="relative mt-8 border-t border-slate-200/80 bg-white/70 py-8 backdrop-blur-sm"
          aria-labelledby="footer-note"
        >
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-semibold text-slate-800">You matter beyond any score.</p>
            <p id="footer-note" className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-slate-500">
              This app supports reflection — it is not a substitute for professional mental health care.
              If you&apos;re in crisis, please reach out to a trusted adult or helpline.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
