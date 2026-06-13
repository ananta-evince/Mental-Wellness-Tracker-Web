import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { buildSystemPrompt, SECTION_HEADINGS } from '../constants';
import { useGemini } from '../hooks/useGemini';

describe('useGemini', () => {
  const originalEnv = import.meta.env.VITE_GEMINI_API_KEY;

  beforeEach(() => {
    import.meta.env.VITE_GEMINI_API_KEY = 'test-api-key';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    import.meta.env.VITE_GEMINI_API_KEY = originalEnv;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('exposes only data, loading, error, and call', () => {
    const { result } = renderHook(() => useGemini());
    expect(Object.keys(result.current).sort()).toEqual(['call', 'data', 'error', 'loading']);
  });

  it('sets loading true during call', async () => {
    let resolveFetch;
    fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = () =>
            resolve({
              ok: true,
              json: async () => ({
                candidates: [{ content: { parts: [{ text: 'You are doing great.' }] } }],
              }),
            });
        })
    );

    const { result } = renderHook(() => useGemini());

    let promise;
    act(() => {
      promise = result.current.call({
        moodScore: 6,
        journalText: 'Long study day',
        exam: 'NEET',
      });
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveFetch();
      await promise;
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('sets error state on failed fetch', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.call({
        moodScore: 5,
        journalText: 'Some journal text',
        exam: 'JEE',
      });
    });

    expect(result.current.error).toMatch(/try again/i);
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('populates data on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: [
                    `## ${SECTION_HEADINGS.stress}`,
                    'Exam pressure noted.',
                    `## ${SECTION_HEADINGS.coping}`,
                    '1. Take breaks',
                    `## ${SECTION_HEADINGS.mindfulness}`,
                    'Box breathing.',
                    '## A note for you',
                    'You have got this.',
                  ].join('\n'),
                },
              ],
            },
          },
        ],
      }),
    });

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.call({
        moodScore: 4,
        journalText: 'Feeling overwhelmed',
        exam: 'NEET',
      });
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.data.sections.stressAnalysis).toMatch(/exam pressure/i);
    expect(result.current.data.sections.mindfulnessExercise).toMatch(/box breathing/i);
    expect(result.current.error).toBeNull();

    const [, options] = fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.systemInstruction.parts[0].text).toBe(buildSystemPrompt('NEET'));
    expect(body.systemInstruction.parts[0].text).toContain(SECTION_HEADINGS.stress);
    expect(body.contents[0].parts[0].text).toContain('Exam: NEET');
  });

  it('rejects missing API key without calling fetch', async () => {
    import.meta.env.VITE_GEMINI_API_KEY = '';

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.call({ moodScore: 5, journalText: 'Valid text', exam: 'NEET' });
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/API key/i);
  });

  it('rejects invalid mood before calling fetch', async () => {
    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.call({ moodScore: 0, journalText: 'Valid text', exam: 'NEET' });
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/valid mood/i);
  });
});
