import { memo } from 'react';
import PropTypes from 'prop-types';
import { MOBILE_NAV_ITEMS } from '../../constants';

function MobileNav({ activePage, onNavigate }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <div className="mobile-nav-inner">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = activePage === item.pageId;
          return (
            <button
              key={item.pageId}
              type="button"
              onClick={() => onNavigate(item.pageId)}
              className={`mobile-nav-item ${isActive ? 'mobile-nav-item-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mobile-nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

MobileNav.propTypes = {
  activePage: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default memo(MobileNav);
