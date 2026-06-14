import { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import PageHeader from '../components/ui/PageHeader';
import { APP_NAME, EXAMS, PREP_STAGES } from '../constants';

function SettingsPage({ profile, onSave, onReset }) {
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback((e) => {
    e.preventDefault();
    onSave(form);
    setSaved(true);
  }, [form, onSave]);

  const handleReset = useCallback(() => {
    if (window.confirm('This will erase all your data. Are you sure?')) onReset();
  }, [onReset]);

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-4">
      <PageHeader title="Settings" subtitle={`Customize your ${APP_NAME} experience`} />

      <form onSubmit={handleSave} className="glass-card space-y-4">
        <div>
          <label htmlFor="settings-name" className="mb-1.5 block text-sm font-medium text-amber-400">Name</label>
          <input id="settings-name" className="input-field" value={form.userName || ''} onChange={(e) => update('userName', e.target.value)} />
        </div>
        <div>
          <label htmlFor="settings-exam" className="mb-1.5 block text-sm font-medium text-amber-400">Exam</label>
          <select id="settings-exam" className="input-field" value={form.selectedExam || 'NEET'} onChange={(e) => update('selectedExam', e.target.value)}>
            {EXAMS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="settings-stage" className="mb-1.5 block text-sm font-medium text-amber-400">Prep Stage</label>
          <select id="settings-stage" className="input-field" value={form.prepStage || ''} onChange={(e) => update('prepStage', e.target.value)}>
            {PREP_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="settings-exam-date" className="mb-1.5 block text-sm font-medium text-amber-400">Exam Date</label>
          <input id="settings-exam-date" type="date" className="input-field" value={form.examDate || ''} onChange={(e) => update('examDate', e.target.value)} />
        </div>

        <fieldset className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <legend className="px-1 text-sm font-medium text-amber-400">Accessibility</legend>
          <label className="flex min-h-[44px] items-center gap-3 text-sm text-slate-300">
            <input type="checkbox" checked={!!form.highContrast} onChange={(e) => update('highContrast', e.target.checked)} className="h-5 w-5 accent-amber-500" />
            High contrast mode
          </label>
          <label className="flex min-h-[44px] items-center gap-3 text-sm text-slate-300">
            <input type="checkbox" checked={!!form.dyslexiaFont} onChange={(e) => update('dyslexiaFont', e.target.checked)} className="h-5 w-5 accent-amber-500" />
            Dyslexia-friendly font
          </label>
        </fieldset>

        <button type="submit" className="btn-primary w-full">{saved ? 'Saved ✓' : 'Save Settings'}</button>
      </form>

      <button type="button" onClick={handleReset} className="btn-ghost w-full border-red-500/30 text-red-400">
        Reset All Data
      </button>
    </div>
  );
}

SettingsPage.propTypes = {
  profile: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default memo(SettingsPage);
