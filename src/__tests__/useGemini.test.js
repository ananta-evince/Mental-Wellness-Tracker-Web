import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { buildSystemPrompt } from '../constants';
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
                  text: 'Stress noted.\n\n1. Take breaks\n\nBreathe slowly.\n\nYou have got this.',
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
    expect(result.current.data.rawText).toContain('Stress noted');
    expect(result.current.data.sections).toBeDefined();
    expect(result.current.error).toBeNull();

    const [, options] = fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.systemInstruction.parts[0].text).toBe(buildSystemPrompt('NEET'));
    expect(body.contents[0].parts[0].text).toContain('Exam: NEET');
  });
});
