import { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { APP_NAME, APP_TAGLINE, EXAMS, PREP_STAGES } from '../constants';
import { isValidUserAge, isValidUserName } from '../utils/profile';

const STEPS = ['welcome', 'academic', 'strengths'];

function OnboardingPage({ onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    userName: '', userAge: '', selectedExam: 'NEET', prepStage: 'Just started',
    achievement: '', challenge: '', motivation: '',
  });
  const [errors, setErrors] = useState({});

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleContinue = useCallback((e) => {
    e?.preventDefault?.();
    if (step === 0) {
      const nameValid = isValidUserName(form.userName);
      const ageValid = isValidUserAge(form.userAge);
      setErrors({
        name: nameValid ? null : 'Please enter your name (at least 2 characters).',
        age: ageValid ? null : 'Please enter a valid age between 13 and 100.',
      });
      if (nameValid && ageValid) setStep(1);
      return;
    }
    if (step === 1) { setStep(2); return; }
    onComplete({
      ...form,
      userName: form.userName.trim(),
      userAge: String(Number(form.userAge)),
      onboardingComplete: true,
    });
  }, [step, form, onComplete]);

  return (
    <div className="onboarding-shell">
      <div className="app-bg" aria-hidden="true">
        <div className="app-bg-orb -left-32 top-0 h-96 w-96 bg-amber-500/10" />
        <div className="app-bg-orb -right-24 top-1/3 h-80 w-80 bg-violet-500/8" />
      </div>

      <a href="#onboarding-heading" className="skip-link">Skip to onboarding</a>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((_, i) => (
            <div key={STEPS[i]} className={i <= step ? 'onboarding-progress-active' : 'onboarding-progress'} />
          ))}
        </div>

        <div className="onboarding-card text-center">
          {step === 0 && (
            <>
              <h1 id="onboarding-heading" className="text-2xl font-bold text-white sm:text-3xl">
                Welcome to <span className="text-gradient aurora-text-glow">{APP_NAME}</span>
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{APP_TAGLINE}</p>
              <form onSubmit={handleContinue} className="mt-6 space-y-4 text-left">
                <div>
                  <label htmlFor="user-name" className="mb-1.5 block text-sm font-medium text-amber-400">What should I call you?</label>
                  <input id="user-name" className="input-field" placeholder="Your name" autoComplete="name" value={form.userName} onChange={(e) => update('userName', e.target.value)} />
                  {errors.name && <p role="alert" className="mt-1 text-xs text-red-400">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="user-age" className="mb-1.5 block text-sm font-medium text-amber-400">Your age</label>
                  <input id="user-age" type="number" min="13" max="100" inputMode="numeric" className="input-field" placeholder="e.g. 17" value={form.userAge} onChange={(e) => update('userAge', e.target.value)} />
                  {errors.age && <p role="alert" className="mt-1 text-xs text-red-400">{errors.age}</p>}
                </div>
                <button type="submit" className="btn-primary w-full">Continue →</button>
                <button type="button" onClick={() => onSkip({ selectedExam: form.selectedExam, onboardingComplete: true })} className="btn-ghost w-full">Skip onboarding →</button>
              </form>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="section-title">Academic Profile</h2>
              <p className="section-subtitle">Tell me about your exam journey</p>
              <div className="mt-6 space-y-5 text-left">
                <div>
                  <p className="mb-2 text-sm font-medium text-amber-400">Which exam are you preparing for?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {EXAMS.map((exam) => (
                      <button key={exam} type="button" onClick={() => update('selectedExam', exam)}
                        className={`chip-btn ${form.selectedExam === exam ? 'chip-btn-active' : ''}`}>
                        {exam}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-amber-400">Preparation stage</p>
                  <div className="space-y-2">
                    {PREP_STAGES.map((stage) => (
                      <button key={stage} type="button" onClick={() => update('prepStage', stage)}
                        className={`chip-btn-block ${form.prepStage === stage ? 'chip-btn-active' : ''}`}>
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={handleContinue} className="btn-primary w-full">Continue →</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="section-title">Discover Your Strengths</h2>
              <p className="section-subtitle">These will become your resilience anchors</p>
              <div className="mt-6 space-y-4 text-left">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-amber-400">A proud achievement</label>
                  <input className="input-field" placeholder="Any achievement, big or small..." value={form.achievement} onChange={(e) => update('achievement', e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-amber-400">A challenge you overcame</label>
                  <input className="input-field" placeholder="A time you proved yourself..." value={form.challenge} onChange={(e) => update('challenge', e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-amber-400">What motivates you?</label>
                  <input className="input-field" placeholder="Your deepest motivation..." value={form.motivation} onChange={(e) => update('motivation', e.target.value)} />
                </div>
                <button type="button" onClick={handleContinue} className="btn-primary w-full">Start my journey →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

OnboardingPage.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
};

export default memo(OnboardingPage);
