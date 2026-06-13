/**
 * Resolves the Gemini API key from server environment variables.
 * Checks multiple common names and trims whitespace.
 * @returns {string}
 */
export function resolveGeminiApiKey() {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  ];

  for (const value of candidates) {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (trimmed && trimmed !== 'your_key_here') {
      return trimmed;
    }
  }

  return '';
}

/**
 * @returns {boolean}
 */
export function isGeminiApiKeyConfigured() {
  return resolveGeminiApiKey().length > 0;
}
