import { lazy, memo, Suspense } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../components/ErrorBoundary';

const HistoryView = lazy(() => import('../components/HistoryView'));

const entryShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  journalText: PropTypes.string.isRequired,
  mood: PropTypes.number.isRequired,
});

const historyFallback = (
  <div className="surface-card animate-pulse motion-reduce:animate-none">
    <p className="text-sm text-slate-500">Loading history…</p>
  </div>
);

/**
 * @component HistoryPage
 * @description Past check-in history with mood trend sparkline
 * @param {Object} props
 * @param {Array<object>} props.entries - journal check-in entries
 */
function HistoryPage({ entries }) {
  return (
    <ErrorBoundary>
      <p className="sr-only">Step 4 of 4: Your journey so far</p>
      <Suspense fallback={historyFallback}>
        <HistoryView entries={entries} />
      </Suspense>
    </ErrorBoundary>
  );
}

HistoryPage.propTypes = {
  entries: PropTypes.arrayOf(entryShape).isRequired,
};

export default memo(HistoryPage);
