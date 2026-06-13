import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, processGeminiRequest, resolveClientId } from '../../lib/geminiHandler.js';

describe('geminiHandler', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    process.env.GEMINI_API_KEY = 'test-server-key';
  });

  describe('checkRateLimit', () => {
    it('allows requests within the limit', () => {
      const clientId = `test-client-${Date.now()}`;
      for (let i = 0; i < 15; i += 1) {
        expect(checkRateLimit(clientId)).toBe(true);
      }
    });

    it('blocks requests exceeding the limit', () => {
      const clientId = `blocked-client-${Date.now()}`;
      for (let i = 0; i < 15; i += 1) {
        checkRateLimit(clientId);
      }
      expect(checkRateLimit(clientId)).toBe(false);
    });
  });

  describe('resolveClientId', () => {
    it('uses x-forwarded-for when present', () => {
      const req = { headers: { 'x-forwarded-for': '203.0.113.1, 70.41.3.18' }, socket: {} };
      expect(resolveClientId(req)).toBe('203.0.113.1');
    });

    it('falls back to socket remote address', () => {
      const req = { headers: {}, socket: { remoteAddress: '127.0.0.1' } };
      expect(resolveClientId(req)).toBe('127.0.0.1');
    });
  });

  describe('processGeminiRequest', () => {
    it('rejects missing API key', async () => {
      const result = await processGeminiRequest(
        { moodScore: 5, journalText: 'Hello', exam: 'NEET' },
        ''
      );
      expect(result.status).toBe(503);
      expect(result.payload.error).toMatch(/not configured/i);
    });

    it('rejects invalid mood score', async () => {
      const result = await processGeminiRequest(
        { moodScore: 99, journalText: 'Hello', exam: 'NEET' },
        'valid-key'
      );
      expect(result.status).toBe(400);
    });

    it('rejects invalid exam', async () => {
      const result = await processGeminiRequest(
        { moodScore: 5, journalText: 'Hello', exam: 'INVALID' },
        'valid-key'
      );
      expect(result.status).toBe(400);
    });

    it('rejects empty journal after sanitisation', async () => {
      const result = await processGeminiRequest(
        { moodScore: 5, journalText: '   ', exam: 'NEET' },
        'valid-key'
      );
      expect(result.status).toBe(400);
    });

    it('returns rawText on successful Gemini response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Wellness insight here.' }] } }],
        }),
      });

      const result = await processGeminiRequest(
        { moodScore: 7, journalText: 'Good study day', exam: 'JEE' },
        'valid-key'
      );

      expect(result.status).toBe(200);
      expect(result.payload.rawText).toBe('Wellness insight here.');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'X-goog-api-key': 'valid-key' }),
        })
      );
    });

    it('maps upstream 429 to rate limit error', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({}) });

      const result = await processGeminiRequest(
        { moodScore: 5, journalText: 'Hello world', exam: 'NEET' },
        'valid-key'
      );

      expect(result.status).toBe(429);
      expect(result.payload.error).toMatch(/too many requests/i);
    });

    it('maps invalid API key to actionable error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: 'API key not valid. Please pass a valid API key.',
            details: [{ reason: 'API_KEY_INVALID' }],
          },
        }),
      });

      const result = await processGeminiRequest(
        { moodScore: 5, journalText: 'Hello world', exam: 'NEET' },
        'bad-key'
      );

      expect(result.status).toBe(502);
      expect(result.payload.error).toMatch(/invalid gemini api key/i);
    });

    it('handles empty Gemini response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: '  ' }] } }] }),
      });

      const result = await processGeminiRequest(
        { moodScore: 5, journalText: 'Hello world', exam: 'NEET' },
        'valid-key'
      );

      expect(result.status).toBe(502);
    });

    it('handles abort timeout', async () => {
      fetch.mockRejectedValueOnce(Object.assign(new Error('Aborted'), { name: 'AbortError' }));

      const result = await processGeminiRequest(
        { moodScore: 5, journalText: 'Hello world', exam: 'NEET' },
        'valid-key'
      );

      expect(result.status).toBe(504);
    });
  });

  describe('handleGeminiRequest', () => {
    it('rejects non-POST methods', async () => {
      const { handleGeminiRequest } = await import('../../lib/geminiHandler.js');
      const res = createMockResponse();

      await handleGeminiRequest({ method: 'GET', headers: {}, socket: {} }, res);

      expect(res.statusCode).toBe(405);
    });

    it('rejects invalid JSON body', async () => {
      const { handleGeminiRequest } = await import('../../lib/geminiHandler.js');
      const res = createMockResponse();
      const req = createMockRequest('not-json');

      await handleGeminiRequest(req, res);

      expect(res.statusCode).toBe(400);
    });

    it('proxies valid requests', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'Insight response.' }] } }],
        }),
      });

      const { handleGeminiRequest } = await import('../../lib/geminiHandler.js');
      const res = createMockResponse();
      const req = createMockRequest(
        JSON.stringify({ moodScore: 6, journalText: 'Good day', exam: 'NEET' })
      );

      await handleGeminiRequest(req, res);

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).rawText).toBe('Insight response.');
    });

    it('returns 429 when rate limit exceeded', async () => {
      const { handleGeminiRequest } = await import('../../lib/geminiHandler.js');
      const clientIp = '203.0.113.99';

      for (let i = 0; i < 16; i += 1) {
        const res = createMockResponse();
        const req = createMockRequest(
          JSON.stringify({ moodScore: 5, journalText: `Entry ${i}`, exam: 'NEET' })
        );
        req.headers['x-forwarded-for'] = clientIp;
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: 'Insight.' }] } }],
          }),
        });
        await handleGeminiRequest(req, res);
        if (i === 15) {
          expect(res.statusCode).toBe(429);
        }
      }
    });
  });
});

function createMockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(payload) {
      this.body = payload;
    },
  };
  return res;
}

function createMockRequest(body) {
  return {
    method: 'POST',
    headers: { 'x-forwarded-for': '198.51.100.1' },
    socket: { remoteAddress: '127.0.0.1' },
    on(event, handler) {
      if (event === 'data') handler(Buffer.from(body));
      if (event === 'end') handler();
    },
  };
}
