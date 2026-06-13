import { describe, it, expect, afterEach } from 'vitest';
import { resolveGeminiApiKey, isGeminiApiKeyConfigured } from '../../lib/resolveApiKey.js';

describe('resolveGeminiApiKey', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('prefers GEMINI_API_KEY', () => {
    process.env.GEMINI_API_KEY = '  server-key  ';
    process.env.VITE_GEMINI_API_KEY = 'client-key';
    expect(resolveGeminiApiKey()).toBe('server-key');
  });

  it('falls back to VITE_GEMINI_API_KEY', () => {
    delete process.env.GEMINI_API_KEY;
    process.env.VITE_GEMINI_API_KEY = 'client-key';
    expect(resolveGeminiApiKey()).toBe('client-key');
  });

  it('ignores placeholder values', () => {
    process.env.GEMINI_API_KEY = 'your_key_here';
    delete process.env.VITE_GEMINI_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    expect(resolveGeminiApiKey()).toBe('');
    expect(isGeminiApiKeyConfigured()).toBe(false);
  });
});
