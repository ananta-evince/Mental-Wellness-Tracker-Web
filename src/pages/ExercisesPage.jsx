import { memo, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import PageHeader from '../components/ui/PageHeader';
import { EXERCISES } from '../constants';

function BreathingExercise({ exercise }) {
  const [phase, setPhase] = useState('ready');
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);

  const { inhale = 4, hold = 7, exhale = 8 } = exercise.pattern || {};

  useEffect(() => {
    if (!active) return undefined;
    let timer;
    if (phase === 'inhale') {
      setCount(inhale);
      timer = setInterval(() => setCount((c) => {
        if (c <= 1) { setPhase('hold'); return hold; }
        return c - 1;
      }), 1000);
    } else if (phase === 'hold') {
      timer = setInterval(() => setCount((c) => {
        if (c <= 1) { setPhase('exhale'); return exhale; }
        return c - 1;
      }), 1000);
    } else if (phase === 'exhale') {
      timer = setInterval(() => setCount((c) => {
        if (c <= 1) { setPhase('inhale'); return inhale; }
        return c - 1;
      }), 1000);
    }
    return () => clearInterval(timer);
  }, [active, phase, inhale, hold, exhale]);

  const start = useCallback(() => { setActive(true); setPhase('inhale'); setCount(inhale); }, [inhale]);
  const stop = useCallback(() => { setActive(false); setPhase('ready'); setCount(0); }, []);

  return (
    <div className="mt-6 text-center">
      {active ? (
        <div className="mx-auto flex h-40 w-40 flex-col items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/5">
          <p className="text-5xl font-bold tabular-nums text-amber-400">{count}</p>
          <p className="mt-1 text-sm capitalize text-slate-400">{phase}</p>
        </div>
      ) : null}
      {active ? (
        <button type="button" onClick={stop} className="btn-ghost mt-6 w-full sm:w-auto">Stop</button>
      ) : (
        <button type="button" onClick={start} className="btn-primary w-full sm:w-auto">Start Exercise</button>
      )}
    </div>
  );
}

BreathingExercise.propTypes = {
  exercise: PropTypes.object.isRequired,
};

function ExercisesPage({ initialExerciseId }) {
  const [selected, setSelected] = useState(initialExerciseId || EXERCISES[0].id);

  useEffect(() => {
    if (initialExerciseId) setSelected(initialExerciseId);
  }, [initialExerciseId]);

  const exercise = EXERCISES.find((e) => e.id === selected) || EXERCISES[0];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Wellness Exercises" subtitle="Quick tools to reset your mind and body" />

      <div className="exercise-scroll" role="tablist" aria-label="Exercise list">
        {EXERCISES.map((ex) => (
          <button
            key={ex.id}
            type="button"
            role="tab"
            aria-selected={selected === ex.id}
            onClick={() => setSelected(ex.id)}
            className={`exercise-chip ${selected === ex.id ? 'chip-btn-active' : ''}`}
          >
            <span className="text-xl" aria-hidden="true">{ex.icon}</span>
            <span className="font-semibold leading-tight">{ex.title}</span>
            <span className="text-[10px] text-slate-500">{ex.duration}</span>
          </button>
        ))}
      </div>

      <div className="glass-card">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl" aria-hidden="true">{exercise.icon}</span>
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl">{exercise.title}</h2>
            <p className="mt-1 text-sm text-slate-400">{exercise.description}</p>
          </div>
        </div>
        {exercise.steps && (
          <ol className="mt-5 list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-slate-300">
            {exercise.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        )}
        {exercise.pattern && <BreathingExercise exercise={exercise} />}
      </div>
    </div>
  );
}

ExercisesPage.propTypes = {
  initialExerciseId: PropTypes.string,
};

export default memo(ExercisesPage);
