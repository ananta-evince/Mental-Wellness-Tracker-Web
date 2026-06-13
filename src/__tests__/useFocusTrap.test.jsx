import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import { useFocusTrap, usePageFocus } from '../hooks/useFocusTrap';
import { APP_PAGES } from '../constants';

function FocusTrapHarness({ isActive }) {
  const ref = useRef(null);
  useFocusTrap(ref, isActive);

  return (
    <div>
      <button type="button">Outside</button>
      <div ref={ref}>
        <button type="button">Inside first</button>
        <button type="button">Inside last</button>
      </div>
    </div>
  );
}

function PageFocusHarness({ pageId }) {
  usePageFocus(pageId);
  return (
    <main>
      <h2 id="main-heading" tabIndex={-1}>
        Main section
      </h2>
    </main>
  );
}

describe('useFocusTrap', () => {
  it('focuses first focusable element when active', () => {
    render(<FocusTrapHarness isActive />);
    expect(screen.getByRole('button', { name: 'Inside first' })).toHaveFocus();
  });

  it('wraps focus from last to first on Tab', () => {
    render(<FocusTrapHarness isActive />);
    const last = screen.getByRole('button', { name: 'Inside last' });
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Inside first' })).toHaveFocus();
  });
});

describe('usePageFocus', () => {
  it('focuses main heading when page changes', () => {
    const { rerender } = render(<PageFocusHarness pageId={APP_PAGES.EXAM_JOURNEY} />);
    expect(document.getElementById('main-heading')).toHaveFocus();

    rerender(<PageFocusHarness pageId={APP_PAGES.CHECK_IN} />);
    expect(document.getElementById('main-heading')).toHaveFocus();
  });
});
