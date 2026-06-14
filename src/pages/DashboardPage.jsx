import { memo } from 'react';
import PropTypes from 'prop-types';
import PageHeader from '../components/ui/PageHeader';
import { getExamCountdown } from '../utils/wellness';

function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card">
      {icon && <span className="mb-1 text-lg" aria-hidden="true">{icon}</span>}
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-bold tabular-nums sm:text-2xl ${color}`}>{value ?? '—'}</p>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  icon: PropTypes.string,
};

function DashboardPage({ profile, stats, checkIns }) {
  const countdown = getExamCountdown(profile.examDate);

  return (
    <div className="space-y-6">
      <PageHeader title="Wellness Dashboard" subtitle="Your wellness at a glance" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Avg Energy" value={stats.avgEnergy} color="text-emerald-400" icon="⚡" />
        <StatCard label="Avg Stress" value={stats.avgStress} color="text-rose-400" icon="😰" />
        <StatCard label="Avg Sleep" value={stats.avgSleep} color="text-violet-400" icon="😴" />
        <StatCard label="Avg Confidence" value={stats.avgConfidence} color="text-amber-400" icon="💪" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass-card p-5 text-center sm:p-6">
          <p className="text-xs text-slate-400">Burnout Risk</p>
          <p className="mt-2 text-3xl font-bold text-amber-400 sm:text-4xl">{stats.burnoutScore ?? '—'}%</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400 sm:text-sm">{stats.burnoutLabel}</p>
        </div>
        <div className="glass-card p-5 text-center sm:p-6">
          <p className="text-xs text-slate-400">Day Streak</p>
          <p className="mt-2 text-3xl font-bold text-violet-400 sm:text-4xl">{stats.streak}</p>
          <p className="mt-2 text-xs text-slate-400 sm:text-sm">consecutive check-ins</p>
        </div>
        <div className="glass-card p-5 text-center sm:col-span-1 sm:p-6">
          <p className="text-xs text-slate-400">Exam Countdown</p>
          <p className="mt-2 text-3xl font-bold text-amber-400 sm:text-4xl">{countdown ?? '—'}</p>
          <p className="mt-2 text-xs text-slate-400 sm:text-sm">
            {countdown !== null ? 'days remaining' : 'Set exam date in Settings'}
          </p>
        </div>
      </div>

      {checkIns.length > 0 && (
        <div className="glass-card">
          <h2 className="mb-4 text-base font-semibold text-white sm:text-lg">Recent Check-ins</h2>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {checkIns.slice(0, 10).map((c) => (
              <div key={c.id || c.date} className="rounded-xl bg-white/[0.03] px-3 py-3 sm:flex sm:items-center sm:justify-between sm:px-4">
                <time className="block text-xs text-slate-500 sm:text-sm">
                  {new Date(c.timestamp || c.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </time>
                <span className="mt-1 block text-xs text-slate-300 sm:mt-0 sm:text-sm">
                  <span className="text-emerald-400">E {c.energy}</span>
                  {' · '}
                  <span className="text-rose-400">S {c.stress}</span>
                  {' · '}
                  <span className="text-violet-400">Sleep {c.sleepQuality}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

DashboardPage.propTypes = {
  profile: PropTypes.object.isRequired,
  stats: PropTypes.object.isRequired,
  checkIns: PropTypes.array.isRequired,
};

export default memo(DashboardPage);
