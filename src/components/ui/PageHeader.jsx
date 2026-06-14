import { memo } from 'react';
import PropTypes from 'prop-types';

function PageHeader({ title, subtitle, align = 'center' }) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center';

  return (
    <header className={`page-header ${alignClass}`}>
      <h1 className="section-title">{title}</h1>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </header>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  align: PropTypes.oneOf(['center', 'left']),
};

export default memo(PageHeader);
