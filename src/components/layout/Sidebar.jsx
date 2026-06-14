import { memo } from 'react';
import PropTypes from 'prop-types';
import { APP_LOGO, APP_NAME, NAV_ITEMS } from '../../constants';

function Sidebar({ activePage, onNavigate, onEmergencyCalm, userName, selectedExam }) {
  return (
    <aside className="sidebar-shell" aria-label="Main navigation">
      <div className="mb-6 flex items-center gap-3 px-2">
        <span className="brand-icon" aria-hidden="true">{APP_LOGO}</span>
        <div>
          <span className="text-lg font-bold text-white">{APP_NAME}</span>
          {selectedExam && (
            <p className="text-[11px] text-slate-500">{selectedExam} prep</p>
          )}
        </div>
      </div>

      {userName && (
        <p className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
          Welcome back, <span className="font-semibold text-amber-400">{userName}</span>
        </p>
      )}

      <nav aria-label="Primary" className="flex-1 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.pageId}
            type="button"
            onClick={() => onNavigate(item.pageId)}
            className={`sidebar-link ${activePage === item.pageId ? 'sidebar-link-active' : ''}`}
            aria-current={activePage === item.pageId ? 'page' : undefined}
          >
            <span className="text-base" aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <button type="button" onClick={onEmergencyCalm} className="btn-primary mt-4 w-full text-xs">
        🆘 Emergency Calm
      </button>
    </aside>
  );
}

Sidebar.propTypes = {
  activePage: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onEmergencyCalm: PropTypes.func.isRequired,
  userName: PropTypes.string,
  selectedExam: PropTypes.string,
};

export default memo(Sidebar);
