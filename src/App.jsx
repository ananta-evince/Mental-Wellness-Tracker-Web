import { useCallback, useReducer, useState } from 'react';
import AIInsights from './components/AIInsights';
import HistoryView from './components/HistoryView';
import JournalEntry from './components/JournalEntry';
import MoodSelector from './components/MoodSelector';
import { useGemini } from './hooks/useGemini';
import { sanitizeText } from './utils/sanitize';

const INITIAL_STATE = {
  entries: [],
  latestSections: null,
};

/**
 * @param {{ entries: Array, latestSections: object | null }} state
 * @param {{ type: string, payload?: object }} action
 */
function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_ENTRY':
      return {
        entries: [action.payload.entry, ...state.entries],
        latestSections: action.payload.sections,
      };
    case 'CLEAR_LATEST':
      return { ...state, latestSections: null };
    default:
      return state;
  }
}

/**
 * Root application — daily journaling, mood logging, and AI wellness insights.
 * @returns {JSX.Element}
 */
export default function App() {
  const [{ entries, latestSections }, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [journalError, setJournalError] = useState(null);
  const [moodError, setMoodError] = useState(null);
  const { analyzeEntry, loading, error, clearError } = useGemini();

  const handleJournalChange = useCallback((value) => {
    setJournalText(value);
    if (value.trim()) setJournalError(null);
  }, []);

  const handleMoodSelect = useCallback((mood) => {
    setSelectedMood(mood);
    setMoodError(null);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      clearError();

      const sanitised = sanitizeText(journalText);
      let hasError = false;

      if (!sanitised) {
        setJournalError('Please write at least a few words before submitting.');
        hasError = true;
      } else {
        setJournalError(null);
      }

      if (selectedMood === null) {
        setMoodError('Please select how you are feeling on the mood scale.');
        hasError = true;
      } else {
        setMoodError(null);
      }

      if (hasError) return;

      const result = await analyzeEntry(selectedMood, sanitised);

      if (result) {
        dispatch({
          type: 'ADD_ENTRY',
          payload: {
            entry: {
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              journalText: sanitised,
              mood: selectedMood,
              sections: result.sections,
            },
            sections: result.sections,
          },
        });
        setJournalText('');
        setSelectedMood(null);
      }
    },
    [journalText, selectedMood, analyzeEntry, clearError]
  );

  const isSubmitDisabled = loading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-50 via-slate-50 to-calm-50">
      <a href="#main-heading" className="skip-link">
        Skip to main content
      </a>

      <header
        className="border-b border-wellness-200 bg-white/80 backdrop-blur-sm"
        aria-labelledby="app-title"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-wellness-100 text-2xl"
            aria-hidden="true"
          >
            🌿
          </span>
          <div>
            <h1 id="app-title" className="text-xl font-bold tracking-tight text-wellness-900 sm:text-2xl">
              Mental Wellness Tracker
            </h1>
            <p className="text-sm text-slate-600">
              A gentle space for NEET, JEE, CUET &amp; more — you&apos;re doing harder things than you think.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6" aria-labelledby="main-heading">
        <h2 id="main-heading" className="sr-only">
          Daily wellness check-in
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate aria-label="Daily wellness check-in form">
          <section
            aria-labelledby="checkin-heading"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 id="checkin-heading" className="text-lg font-semibold text-slate-900">
              Today&apos;s check-in
            </h3>
            <div className="mt-5 space-y-6">
              <JournalEntry
                value={journalText}
                onChange={handleJournalChange}
                disabled={loading}
                validationError={journalError}
              />
              <MoodSelector
                selectedMood={selectedMood}
                onSelect={handleMoodSelect}
                disabled={loading}
                validationError={moodError}
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitDisabled}
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
                    <span aria-live="polite">Analyzing…</span>
                  </>
                ) : (
                  'Get wellness insights'
                )}
              </button>
              {!loading && !journalText.trim() && (
                <p className="text-xs text-slate-500">Write in your journal to enable submit.</p>
              )}
            </div>
          </section>
        </form>

        <div className="mt-8 space-y-8">
          <AIInsights sections={latestSections} loading={loading} error={error} />
          <HistoryView entries={entries} />
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
