/**
 * Resolves the Gemini API key from server environment variables.
 * Checks multiple common names, trims whitespace, and strips quotes.
 * @returns {string}
 */
export function resolveGeminiApiKey() {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  ];

  for (const value of candidates) {
    const trimmed = normalizeEnvValue(value);
    if (trimmed && trimmed !== 'your_key_here') {
      return trimmed;
    }
  }

  return '';
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function normalizeEnvValue(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^['"]|['"]$/g, '');
}

/**
 * @returns {boolean}
 */
export function isGeminiApiKeyConfigured() {
  return resolveGeminiApiKey().length > 0;
}
