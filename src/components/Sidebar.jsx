import { memo, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { APP_PAGES, SIDEBAR_NAV_ITEMS } from '../constants';
import { useFocusTrap } from '../hooks/useFocusTrap';

/**
 * @component SidebarNavItem
 * @description Single sidebar navigation button
 * @param {Object} props
 * @param {{ pageId: string, label: string, icon: string }} props.item - nav item config
 * @param {boolean} props.isActive - whether this page is currently active
 * @param {Function} props.onSelect - callback when this item is selected
 */
const SidebarNavItem = memo(function SidebarNavItem({ item, isActive, onSelect }) {
  const handleClick = useCallback(() => {
    onSelect(item.pageId);
  }, [item.pageId, onSelect]);

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="sidebar-link-icon" aria-hidden="true">
          {item.icon}
        </span>
        <span className="leading-snug">{item.label}</span>
      </button>
    </li>
  );
});

SidebarNavItem.propTypes = {
  item: PropTypes.shape({
    pageId: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

/**
 * @component Sidebar
 * @description Fixed sidebar navigation for wellness tracker pages
 * @param {Object} props
 * @param {string} props.activePage - currently active page id
 * @param {Function} props.onNavigate - callback when a page is selected
 * @param {string} props.selectedExam - currently selected exam name
 * @param {string} props.examEmoji - emoji for selected exam
 * @param {number} props.entryCount - number of recorded check-ins
 */
function Sidebar({ activePage, onNavigate, selectedExam, examEmoji, entryCount }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sidebarRef = useRef(null);

  useFocusTrap(sidebarRef, isMobileOpen);

  const handleOpenMenu = useCallback(() => {
    setIsMobileOpen(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const handlePageSelect = useCallback(
    (pageId) => {
      onNavigate(pageId);
      setIsMobileOpen(false);
    },
    [onNavigate]
  );

  useEffect(() => {
    if (!isMobileOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsMobileOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen]);

  const sidebarContent = (
    <>
      <div className="sidebar-brand">
        <span className="sidebar-logo" aria-hidden="true">
          🌿
        </span>
        <div>
          <p className="text-sm font-bold text-white">Wellness Tracker</p>
          <p className="text-[11px] text-wellness-200/90">AI companion for exam prep</p>
        </div>
      </div>

      <nav aria-label="Primary" className="mt-6 flex-1 overflow-y-auto px-1">
        <p className="sidebar-section-label" id="sidebar-nav-label">
          Navigate
        </p>
        <ul className="space-y-0.5" aria-labelledby="sidebar-nav-label">
          {SIDEBAR_NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.pageId}
              item={item}
              isActive={activePage === item.pageId}
              onSelect={handlePageSelect}
            />
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-section-label">Preparing for</p>
        <div className="sidebar-exam-badge">
          <span className="text-lg" aria-hidden="true">
            {examEmoji}
          </span>
          <span className="text-sm font-semibold text-white">{selectedExam}</span>
        </div>
        <p className="mt-3 px-3 text-[11px] leading-relaxed text-wellness-200/60">
          {entryCount === 0
            ? 'No check-ins yet — start your first reflection.'
            : `${entryCount} check-in${entryCount === 1 ? '' : 's'} recorded`}
        </p>
      </div>
    </>
  );

  return (
    <>
      <div className="mobile-topbar">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-wellness-500 to-wellness-700 text-base shadow-sm">
            🌿
          </span>
          <span className="text-sm font-bold text-slate-900">Wellness Tracker</span>
        </div>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wellness-500"
          aria-expanded={isMobileOpen}
          aria-controls="sidebar-panel"
          aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={isMobileOpen ? handleCloseMenu : handleOpenMenu}
        >
          {isMobileOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {isMobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop lg:hidden"
          aria-label="Dismiss menu overlay"
          onClick={handleCloseMenu}
        />
      )}

      <aside
        ref={sidebarRef}
        id="sidebar-panel"
        className={`sidebar-shell ${isMobileOpen ? 'sidebar-shell-open' : ''}`}
        aria-label="Site sidebar"
      >
        {sidebarContent}
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  activePage: PropTypes.oneOf(Object.values(APP_PAGES)).isRequired,
  onNavigate: PropTypes.func.isRequired,
  selectedExam: PropTypes.string.isRequired,
  examEmoji: PropTypes.string.isRequired,
  entryCount: PropTypes.number.isRequired,
};

export default memo(Sidebar);
