import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SYSTEM_PROMPT } from '../constants';
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

  it('sets loading true while request is in flight', async () => {
    let resolveFetch;
    fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = () =>
            resolve({
              ok: true,
              json: async () => ({
                candidates: [{ content: { parts: [{ text: 'You are doing great. Breathe slowly.' }] } }],
              }),
            });
        })
    );

    const { result } = renderHook(() => useGemini());

    let promise;
    act(() => {
      promise = result.current.analyzeEntry(6, 'Long study day today');
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveFetch();
      await promise;
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('returns parsed sections on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'I notice exam pressure showing up.\n\nTry a 10-minute walk and break tasks into chunks.\n\nBox breathing for 4 counts each.\n\nYou have got this — one page at a time.',
                },
              ],
            },
          },
        ],
      }),
    });

    const { result } = renderHook(() => useGemini());

    let analysis;
    await act(async () => {
      analysis = await result.current.analyzeEntry(4, 'Feeling overwhelmed by syllabus');
    });

    expect(analysis).not.toBeNull();
    expect(analysis.rawText).toContain('exam pressure');
    expect(analysis.sections).toBeDefined();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('sends system prompt and formatted user message in request body', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Great job today.' }] } }],
      }),
    });

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.analyzeEntry(7, 'Finished one chapter');
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    const [, options] = fetch.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.systemInstruction.parts[0].text).toBe(SYSTEM_PROMPT);
    expect(body.contents[0].parts[0].text).toBe(
      'Mood score: 7/10. Journal entry: Finished one chapter'
    );
    expect(options.headers['X-goog-api-key']).toBe('test-api-key');
  });

  it('sets a user-friendly error when fetch fails', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.analyzeEntry(5, 'Some journal text here');
    });

    expect(result.current.error).toMatch(/try again/i);
    expect(result.current.loading).toBe(false);
  });

  it('handles 429 rate limit with friendly message', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 429 });

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.analyzeEntry(5, 'Some journal text here');
    });

    expect(result.current.error).toMatch(/too many requests/i);
  });

  it('reports missing API key without calling fetch', async () => {
    import.meta.env.VITE_GEMINI_API_KEY = '';

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.analyzeEntry(7, 'Valid entry text');
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/API key/i);
  });

  it('rejects empty journal text before calling fetch', async () => {
    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.analyzeEntry(5, '   ');
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/write something/i);
  });

  it('rejects invalid mood score before calling fetch', async () => {
    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.analyzeEntry(11, 'Valid journal entry');
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/valid mood/i);
  });

  it('clearError resets error state', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.analyzeEntry(5, 'Some journal text here');
    });

    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
