import { useEffect } from 'react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus within a container while active (e.g. mobile nav drawer).
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {boolean} isActive
 */
export function useFocusTrap(containerRef, isActive) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return undefined;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement;

    const getFocusable = () => Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));

    const focusFirst = () => {
      const focusable = getFocusable();
      focusable[0]?.focus();
    };

    focusFirst();

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [containerRef, isActive]);
}

/**
 * Moves focus to the main heading when the active page changes.
 * @param {string} pageId
 */
export function usePageFocus(pageId) {
  useEffect(() => {
    const heading = document.getElementById('main-heading');
    if (heading instanceof HTMLElement) {
      heading.focus({ preventScroll: true });
    }
  }, [pageId]);
}
