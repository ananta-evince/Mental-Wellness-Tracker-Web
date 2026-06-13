import { useCallback, useRef, useState } from 'react';
import { GEMINI_API_URL, REQUEST_TIMEOUT_MS, SYSTEM_PROMPT } from '../constants';
import { parseGeminiResponse, sanitizeText } from '../utils/sanitize';
import { isValidMoodScore } from '../utils/validation';

/**
 * Custom hook encapsulating Gemini API calls, loading, and error state.
 * @returns {{
 *   analyzeEntry: (moodScore: number, journalText: string) => Promise<object | null>,
 *   loading: boolean,
 *   error: string | null,
 *   clearError: () => void
 * }}
 */
export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const clearError = useCallback(() => setError(null), []);

  const analyzeEntry = useCallback(async (moodScore, journalText) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_key_here') {
      setError('API key missing. Add VITE_GEMINI_API_KEY to your .env file.');
      return null;
    }

    if (!isValidMoodScore(moodScore)) {
      setError('Please select a valid mood between 1 and 10.');
      return null;
    }

    const sanitisedText = sanitizeText(journalText);

    if (!sanitisedText) {
      setError('Please write something in your journal before submitting.');
      return null;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    setLoading(true);
    setError(null);

    try {
      const userMessage = `Mood score: ${moodScore}/10. Journal entry: ${sanitisedText}`;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const statusHint =
          response.status === 429
            ? 'Too many requests. Please wait a moment and try again.'
            : 'Unable to reach the wellness companion. Please try again shortly.';
        throw new Error(statusHint);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

      if (!rawText) {
        throw new Error('We received an empty response. Please try again.');
      }

      return {
        rawText,
        sections: parseGeminiResponse(rawText),
      };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('The request took too long. Please check your connection and try again.');
        return null;
      }

      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Something went wrong while analyzing your entry. Please try again.';
      setError(message);
      return null;
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  return { analyzeEntry, loading, error, clearError };
}
