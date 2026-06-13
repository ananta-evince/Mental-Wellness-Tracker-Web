import { useCallback, useRef, useState } from 'react';
import { buildSystemPrompt, GEMINI_API_URL, REQUEST_TIMEOUT_MS } from '../constants';
import { parseGeminiResponse, sanitiseInput } from '../utils/sanitize';
import { isValidMoodScore } from '../utils/validation';

/**
 * Encapsulates all Gemini API calls. Exposes only { data, loading, error, call }.
 * @returns {{ data: object | null, loading: boolean, error: string | null, call: Function }}
 */
export function useGemini() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const call = useCallback(async ({ moodScore, journalText, exam }) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_key_here') {
      setError('API key missing. Add VITE_GEMINI_API_KEY to your .env file.');
      setData(null);
      return null;
    }

    if (!isValidMoodScore(moodScore)) {
      setError('Please select a valid mood between 1 and 10.');
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
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const systemPrompt = buildSystemPrompt(exam);
      const userMessage = `Exam: ${exam}. Mood score: ${moodScore}/10. Journal entry: ${sanitisedText}`;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        }),
      });

      if (!response.ok) {
        const statusHint =
          response.status === 429
            ? 'Too many requests. Please wait a moment and try again.'
            : 'Unable to reach the wellness companion. Please try again shortly.';
        throw new Error(statusHint);
      }

      const responseData = await response.json();
      const rawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

      if (!rawText) {
        throw new Error('We received an empty response. Please try again.');
      }

      const result = {
        rawText,
        sections: parseGeminiResponse(rawText),
      };

      setData(result);
      return result;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('The request took too long. Please check your connection and try again.');
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
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  return { data, loading, error, call };
}
