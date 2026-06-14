import { memo, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { APP_LOGO, APP_NAME, APP_PAGES } from '../../constants';

function MobileHeader({ userName, selectedExam, activePage, onNavigate, onEmergencyCalm }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) closeMenu();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    closeMenu();
  }, [activePage, closeMenu]);

  const menuItems = [
    { pageId: APP_PAGES.EXERCISES, label: 'Exercises', icon: '🧘' },
    { pageId: APP_PAGES.SETTINGS, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <header className="mobile-header" aria-label="App header">
      <div className="mobile-header-inner">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="brand-icon" aria-hidden="true">{APP_LOGO}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{APP_NAME}</p>
            <p className="truncate text-[11px] text-slate-400">
              {userName ? `Hi, ${userName}` : selectedExam}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onEmergencyCalm}
            className="mobile-icon-btn mobile-icon-btn-emergency"
            aria-label="Emergency calm"
          >
            🆘
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="mobile-icon-btn"
              aria-label="More options"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              ⋮
            </button>

            {menuOpen && (
              <div className="mobile-menu-dropdown" role="menu">
                {menuItems.map((item) => (
                  <button
                    key={item.pageId}
                    type="button"
                    role="menuitem"
                    onClick={() => { onNavigate(item.pageId); closeMenu(); }}
                    className={`mobile-menu-item ${activePage === item.pageId ? 'mobile-menu-item-active' : ''}`}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

MobileHeader.propTypes = {
  userName: PropTypes.string,
  selectedExam: PropTypes.string,
  activePage: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onEmergencyCalm: PropTypes.func.isRequired,
};

export default memo(MobileHeader);
