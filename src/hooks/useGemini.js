import { useCallback, useRef, useState } from 'react';
import { GEMINI_PROXY_URL, MIN_CALL_INTERVAL_MS, MIN_MOOD, MAX_MOOD } from '../constants';
import { parseGeminiResponse, sanitiseInput } from '../utils/sanitize';
import { isValidExam, isValidMoodScore } from '../utils/validation';

/**
 * Encapsulates wellness API calls via the server proxy. Exposes only { data, loading, error, call }.
 * @returns {{ data: object | null, loading: boolean, error: string | null, call: Function }}
 */
export function useGemini() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const lastCallAtRef = useRef(0);

  const call = useCallback(async ({ moodScore, journalText, exam }) => {
    const now = Date.now();
    if (now - lastCallAtRef.current < MIN_CALL_INTERVAL_MS) {
      setError('Please wait a moment before submitting again.');
      setData(null);
      return null;
    }

    if (!isValidMoodScore(moodScore)) {
      setError(`Please select a valid mood between ${MIN_MOOD} and ${MAX_MOOD}.`);
      setData(null);
      return null;
    }

    if (!isValidExam(exam)) {
      setError('Please select a valid exam before submitting.');
      setData(null);
      return null;
    }

    const sanitisedText = sanitiseInput(journalText);

    if (!sanitisedText) {
      setError('Please write something in your journal before submitting.');
      setData(null);
      return null;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(GEMINI_PROXY_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodScore, journalText: sanitisedText, exam }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseData.error ??
            (response.status === 429
              ? 'Too many requests. Please wait a moment and try again.'
              : 'Unable to reach the wellness companion. Please try again shortly.')
        );
      }

      const rawText = responseData.rawText?.trim() ?? '';
      if (!rawText) {
        throw new Error('We received an empty response. Please try again.');
      }

      lastCallAtRef.current = Date.now();
      const result = {
        rawText,
        sections: parseGeminiResponse(rawText),
      };

      setData(result);
      return result;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('The request was cancelled. Please try again.');
      } else {
        setError(
          err instanceof Error && err.message
            ? err.message
            : 'Something went wrong while analyzing your entry. Please try again.'
        );
      }
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, call };
}
