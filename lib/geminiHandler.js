import { buildSystemPrompt, buildChatSystemPrompt, REQUEST_TIMEOUT_MS } from '../src/constants.js';
import { callGeminiGenerateContent, mapGeminiError } from './callGemini.js';
import { resolveGeminiApiKey } from './resolveApiKey.js';
import { sanitiseInput } from '../src/utils/sanitize.js';
import { isValidExam, isValidMoodScore } from '../src/utils/validation.js';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const rateLimitStore = new Map();

/**
 * @param {string} clientId
 * @returns {boolean}
 */
export function checkRateLimit(clientId) {
  const now = Date.now();
  const bucket = rateLimitStore.get(clientId) ?? { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now >= bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  bucket.count += 1;
  rateLimitStore.set(clientId, bucket);
  return bucket.count <= RATE_LIMIT_MAX_REQUESTS;
}

/**
 * Resolves client identifier from request headers.
 * @param {import('http').IncomingMessage} req
 */
export function resolveClientId(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? 'unknown';
}

/**
 * Validates and processes a Gemini wellness request.
 * @param {object} body
 * @param {string} apiKey
 */
export async function processGeminiRequest(body, apiKey) {
  if (!apiKey || apiKey === 'your_key_here') {
    return {
      status: 503,
      payload: {
        error:
          'Wellness service is not configured. Add GEMINI_API_KEY in Vercel → Settings → Environment Variables, then redeploy.',
      },
    };
  }

  const { type = 'checkin' } = body ?? {};

  if (type === 'journal') return processJournalRequest(body, apiKey);
  if (type === 'chat') return processChatRequest(body, apiKey);
  return processCheckInRequest(body, apiKey);
}

async function processJournalRequest(body, apiKey) {
  const { journalText, exam, userName, userAge } = body ?? {};

  if (!isValidExam(exam)) {
    return { status: 400, payload: { error: 'Invalid exam selection.' } };
  }

  const sanitisedText = sanitiseInput(journalText);
  if (!sanitisedText) {
    return { status: 400, payload: { error: 'Journal entry is required.' } };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const systemPrompt = buildSystemPrompt(exam, { userName, userAge });
    const userMessage = `Journal entry: ${sanitisedText}`;
    const requestBody = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    };

    const response = await callGeminiGenerateContent(apiKey, requestBody, controller.signal);
    if (!response?.ok) {
      return { status: response?.status === 429 ? 429 : 502, payload: { error: await mapGeminiError(response) } };
    }

    const responseData = await response.json();
    const rawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    if (!rawText) {
      return { status: 502, payload: { error: 'We received an empty response. Please try again.' } };
    }
    return { status: 200, payload: { rawText } };
  } catch (err) {
    return handleGeminiError(err);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function processChatRequest(body, apiKey) {
  const { message, exam, userName, history = [] } = body ?? {};

  if (!isValidExam(exam)) {
    return { status: 400, payload: { error: 'Invalid exam selection.' } };
  }

  const sanitisedMessage = sanitiseInput(message);
  if (!sanitisedMessage) {
    return { status: 400, payload: { error: 'Message is required.' } };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const systemPrompt = buildChatSystemPrompt(exam, userName);
    const contents = [
      ...history.slice(-10).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: sanitisedMessage }] },
    ];

    const requestBody = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
    };

    const response = await callGeminiGenerateContent(apiKey, requestBody, controller.signal);
    if (!response?.ok) {
      return { status: response?.status === 429 ? 429 : 502, payload: { error: await mapGeminiError(response) } };
    }

    const responseData = await response.json();
    const reply = responseData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    if (!reply) {
      return { status: 502, payload: { error: 'We received an empty response. Please try again.' } };
    }
    return { status: 200, payload: { reply } };
  } catch (err) {
    return handleGeminiError(err);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function processCheckInRequest(body, apiKey) {
  const { moodScore, journalText, exam, userName, userAge } = body ?? {};

  if (!isValidMoodScore(moodScore)) {
    return { status: 400, payload: { error: 'Invalid mood score.' } };
  }

  if (!isValidExam(exam)) {
    return { status: 400, payload: { error: 'Invalid exam selection.' } };
  }

  const sanitisedText = sanitiseInput(journalText);
  if (!sanitisedText) {
    return { status: 400, payload: { error: 'Journal entry is required.' } };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const systemPrompt = buildSystemPrompt(exam, { userName, userAge });
    const profileNote = [
      userName ? `Student name: ${userName}.` : '',
      userAge ? `Age: ${userAge}.` : '',
    ]
      .filter(Boolean)
      .join(' ');
    const userMessage = `${profileNote ? `${profileNote} ` : ''}Exam: ${exam}. Mood score: ${moodScore}/10. Journal entry: ${sanitisedText}`;

    const requestBody = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    };

    const response = await callGeminiGenerateContent(apiKey, requestBody, controller.signal);

    if (!response?.ok) {
      const errorMessage = await mapGeminiError(response);
      return {
        status: response?.status === 429 ? 429 : 502,
        payload: { error: errorMessage },
      };
    }

    const responseData = await response.json();
    const rawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    if (!rawText) {
      return { status: 502, payload: { error: 'We received an empty response. Please try again.' } };
    }

    return { status: 200, payload: { rawText } };
  } catch (err) {
    return handleGeminiError(err);
  } finally {
    clearTimeout(timeoutId);
  }
}

function handleGeminiError(err) {
  if (err instanceof Error && err.name === 'AbortError') {
    return {
      status: 504,
      payload: { error: 'The request took too long. Please check your connection and try again.' },
    };
  }
  return { status: 500, payload: { error: 'Something went wrong. Please try again.' } };
}

/**
 * Handles Gemini proxy requests for Vercel and Vite dev server.
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export async function handleGeminiRequest(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const clientId = resolveClientId(req);
  if (!checkRateLimit(clientId)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', '60');
    res.end(JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }));
    return;
  }

  let body;
  try {
    const raw = await readRequestBody(req);
    body = JSON.parse(raw);
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid request body.' }));
    return;
  }

  const apiKey = resolveGeminiApiKey();
  const result = await processGeminiRequest(body, apiKey);

  res.statusCode = result.status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result.payload));
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<string>}
 */
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
