import { useCallback, useRef, useState } from 'react';
import { GEMINI_PROXY_URL, MIN_CALL_INTERVAL_MS } from '../constants';
import { parseGeminiResponse, sanitiseInput } from '../utils/sanitize';

async function postGemini(body, signal) {
  const response = await fetch(GEMINI_PROXY_URL, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data.error ??
        (response.status === 429
          ? 'Too many requests. Please wait a moment and try again.'
          : 'Unable to reach the wellness companion. Please try again shortly.')
    );
  }
  return data;
}

export function useWellnessApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const lastCallAtRef = useRef(0);

  const guardRateLimit = useCallback(() => {
    const now = Date.now();
    if (now - lastCallAtRef.current < MIN_CALL_INTERVAL_MS) {
      setError('Please wait a moment before trying again.');
      return false;
    }
    return true;
  }, []);

  const analyzeJournal = useCallback(async ({ journalText, exam, userName, userAge }) => {
    const text = sanitiseInput(journalText);
    if (!text) {
      setError('Please write something in your journal.');
      return null;
    }
    if (!guardRateLimit()) return null;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const data = await postGemini(
        { type: 'journal', journalText: text, exam, userName, userAge },
        controller.signal
      );
      lastCallAtRef.current = Date.now();
      const sections = parseGeminiResponse(data.rawText ?? '');
      return {
        emotional: sections.stressAnalysis,
        academic: sections.copingStrategies,
        environmental: sections.mindfulnessExercise,
        note: sections.motivationalMessage,
      };
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [guardRateLimit]);

  const sendChat = useCallback(async ({ message, exam, userName, history = [] }) => {
    const text = sanitiseInput(message);
    if (!text) return null;
    if (!guardRateLimit()) return null;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const data = await postGemini(
        { type: 'chat', message: text, exam, userName, history },
        controller.signal
      );
      lastCallAtRef.current = Date.now();
      return data.reply?.trim() ?? '';
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [guardRateLimit]);

  return { loading, error, analyzeJournal, sendChat };
}
