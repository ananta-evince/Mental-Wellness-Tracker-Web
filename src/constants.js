export const MAX_JOURNAL_LENGTH = 2000;

export const REQUEST_TIMEOUT_MS = 30000;

export const GEMINI_MODEL = 'gemini-flash-latest';

export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const SYSTEM_PROMPT =
  'You are an empathetic mental wellness companion for students facing high-stakes exams in India (NEET, JEE, CUET, CAT, GATE, UPSC). Your role is to: (1) identify hidden stress triggers and emotional patterns in the student\'s journal entry, (2) provide 2–3 specific, actionable coping strategies tailored to their situation, (3) recommend one adaptive mindfulness exercise appropriate to their current stress level, and (4) close with a short motivational message. Always respond in a warm, non-clinical, encouraging tone. Never diagnose. Keep total response under 300 words.';

export const MOOD_EMOJIS = {
  1: '😰',
  2: '😔',
  3: '😟',
  4: '😕',
  5: '😐',
  6: '🙂',
  7: '😊',
  8: '😄',
  9: '😁',
  10: '🌟',
};

export const MOOD_LABELS = {
  1: 'Very low',
  2: 'Low',
  3: 'Struggling',
  4: 'Uneasy',
  5: 'Neutral',
  6: 'Okay',
  7: 'Good',
  8: 'Bright',
  9: 'Great',
  10: 'Excellent',
};
