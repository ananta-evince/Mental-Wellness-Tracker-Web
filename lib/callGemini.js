import { GEMINI_MODELS, REQUEST_TIMEOUT_MS } from '../src/constants.js';

/**
 * Maps Gemini API error responses to user-friendly messages.
 * @param {Response} response
 */
export async function mapGeminiError(response) {
  if (response.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  try {
    const data = await response.json();
    const message = data?.error?.message ?? '';
    const reason = data?.error?.details?.find((d) => d.reason)?.reason ?? '';

    if (reason === 'API_KEY_INVALID' || /api key not valid/i.test(message)) {
      return 'Invalid Gemini API key. Update GEMINI_API_KEY in Vercel → Settings → Environment Variables, then redeploy.';
    }

    if (response.status === 403 || reason === 'API_KEY_SERVICE_BLOCKED') {
      return 'API key access denied. In Google AI Studio, remove IP or referrer restrictions (server calls need unrestricted or no IP limit).';
    }

    if (response.status === 404 || /not found/i.test(message)) {
      return 'AI model temporarily unavailable. Please try again in a moment.';
    }

    if (message) {
      return message;
    }
  } catch {
    // fall through to generic message
  }

  return 'Unable to reach the wellness companion. Please try again shortly.';
}

/**
 * Calls Gemini generateContent with model fallbacks.
 * @param {string} apiKey
 * @param {object} requestBody
 * @param {AbortSignal} signal
 * @returns {Promise<Response>}
 */
export async function callGeminiGenerateContent(apiKey, requestBody, signal) {
  let lastResponse = null;

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    lastResponse = response;

    if (response.status === 404) {
      continue;
    }

    return response;
  }

  return lastResponse;
}

export { REQUEST_TIMEOUT_MS };
