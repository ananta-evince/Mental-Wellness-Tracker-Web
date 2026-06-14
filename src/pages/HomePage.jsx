import { memo } from 'react';
import PropTypes from 'prop-types';
import { APP_NAME, APP_PAGES, EXAM_META } from '../constants';
import { getGreeting } from '../utils/wellness';

function HomePage({ profile, stats, onNavigate }) {
  const greeting = getGreeting(profile.userName);
  const examMeta = EXAM_META[profile.selectedExam];

  const actions = [
    { page: APP_PAGES.CHAT, label: `Talk to ${APP_NAME}`, icon: '💬', desc: 'Chat with your AI companion', accent: 'from-violet-500/20 to-violet-600/5' },
    { page: APP_PAGES.JOURNAL, label: 'Write Journal', icon: '📔', desc: 'Express yourself freely', accent: 'from-amber-500/20 to-amber-600/5' },
    { page: APP_PAGES.DASHBOARD, label: 'View Dashboard', icon: '📊', desc: 'Your wellness at a glance', accent: 'from-emerald-500/20 to-emerald-600/5' },
    { page: APP_PAGES.CHECK_IN, label: 'Daily Check-in', icon: '✅', desc: 'Track how you feel today', accent: 'from-rose-500/20 to-rose-600/5' },
  ];

  return (
    <div className="space-y-6">
      <section className="hero-section">
        <span className="section-badge">{examMeta?.emoji} {profile.selectedExam}</span>
        <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl md:text-4xl">{greeting}</h1>
        <p className="mt-2 text-sm text-amber-400 sm:text-base">Keep showing up for yourself</p>
      </section>

      <section aria-label="Quick actions">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {actions.map((a) => (
            <button
              key={a.page}
              type="button"
              onClick={() => onNavigate(a.page)}
              className={`action-card bg-gradient-to-br ${a.accent}`}
            >
              <span className="action-card-icon" aria-hidden="true">{a.icon}</span>
              <div className="min-w-0 flex-1 md:text-center">
                <p className="text-sm font-semibold text-white">{a.label}</p>
                <p className="mt-0.5 text-xs text-slate-400">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {stats.burnoutScore !== null ? (
        <section className="glass-card">
          <h2 className="text-base font-semibold text-white sm:text-lg">Wellness Snapshot</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Burnout Risk', value: `${stats.burnoutScore}%`, color: 'text-amber-400' },
              { label: 'Day Streak', value: stats.streak, color: 'text-violet-400' },
              { label: 'Avg Stress', value: stats.avgStress ?? '—', color: 'text-rose-400' },
              { label: 'Avg Energy', value: stats.avgEnergy ?? '—', color: 'text-emerald-400' },
            ].map((s) => (
              <div key={s.label} className="stat-card !p-3">
                <p className="text-[11px] text-slate-400">{s.label}</p>
                <p className={`mt-1 text-xl font-bold sm:text-2xl ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-white/[0.03] p-3 text-sm leading-relaxed text-slate-400">{stats.burnoutLabel}</p>
        </section>
      ) : (
        <section className="glass-card text-center">
          <p className="text-3xl" aria-hidden="true">🌱</p>
          <p className="mt-2 text-sm font-medium text-white">Start your wellness journey</p>
          <p className="mt-1 text-xs text-slate-400">Complete your first check-in to see your snapshot</p>
          <button type="button" onClick={() => onNavigate(APP_PAGES.CHECK_IN)} className="btn-primary mt-4 w-full sm:w-auto">
            Do your first check-in
          </button>
        </section>
      )}
    </div>
  );
}

HomePage.propTypes = {
  profile: PropTypes.object.isRequired,
  stats: PropTypes.object.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default memo(HomePage);
