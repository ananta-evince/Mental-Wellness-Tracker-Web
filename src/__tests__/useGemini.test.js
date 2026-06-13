import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { GEMINI_PROXY_URL, MIN_CALL_INTERVAL_MS, SECTION_HEADINGS } from '../constants';
import { useGemini } from '../hooks/useGemini';

describe('useGemini', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
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
              json: async () => ({ rawText: 'You are doing great.' }),
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
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    });

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.call({
        moodScore: 5,
        journalText: 'Some journal text',
        exam: 'JEE',
      });
    });

    expect(result.current.error).toBe('Server error');
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('populates data on success via proxy', async () => {
    const rawText = [
      `## ${SECTION_HEADINGS.stress}`,
      'Exam pressure noted.',
      `## ${SECTION_HEADINGS.coping}`,
      '1. Take breaks',
      `## ${SECTION_HEADINGS.mindfulness}`,
      'Box breathing.',
      '## A note for you',
      'You have got this.',
    ].join('\n');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rawText }),
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

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe(GEMINI_PROXY_URL);
    expect(options.method).toBe('POST');
    const body = JSON.parse(options.body);
    expect(body.exam).toBe('NEET');
    expect(body.moodScore).toBe(4);
    expect(body.journalText).toBe('Feeling overwhelmed');
  });

  it('rejects rapid successive calls', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ rawText: 'Insight one.' }),
    });

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.call({ moodScore: 5, journalText: 'First entry', exam: 'NEET' });
    });

    await act(async () => {
      await result.current.call({ moodScore: 6, journalText: 'Second entry', exam: 'NEET' });
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.current.error).toMatch(/wait a moment/i);
  });

  it('allows call after minimum interval', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ rawText: 'Insight text.' }),
    });

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.call({ moodScore: 5, journalText: 'First entry', exam: 'NEET' });
    });

    await act(async () => {
      vi.advanceTimersByTime(MIN_CALL_INTERVAL_MS + 100);
    });

    await act(async () => {
      await result.current.call({ moodScore: 6, journalText: 'Second entry', exam: 'NEET' });
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('rejects invalid mood before calling fetch', async () => {
    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.call({ moodScore: 0, journalText: 'Valid text', exam: 'NEET' });
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/valid mood/i);
  });

  it('rejects invalid exam before calling fetch', async () => {
    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.call({ moodScore: 5, journalText: 'Valid text', exam: 'INVALID' });
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/valid exam/i);
  });

  it('handles empty proxy response', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rawText: '   ' }),
    });

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.call({ moodScore: 5, journalText: 'Valid text', exam: 'NEET' });
    });

    expect(result.current.error).toMatch(/empty response/i);
  });

  it('handles aborted requests', async () => {
    fetch.mockRejectedValueOnce(Object.assign(new Error('Aborted'), { name: 'AbortError' }));

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.call({ moodScore: 5, journalText: 'Valid text', exam: 'NEET' });
    });

    expect(result.current.error).toMatch(/cancelled/i);
  });
});
