import { handleGeminiRequest } from '../lib/geminiHandler.js';

/** @type {import('@vercel/node').VercelRequest} */
/** @type {import('@vercel/node').VercelResponse} */

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  return handleGeminiRequest(req, res);
}
