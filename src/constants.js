export const MAX_JOURNAL_LENGTH = 2000;

export const REQUEST_TIMEOUT_MS = 30000;

export const GEMINI_MODEL = 'gemini-flash-latest';

export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const EXAMS = ['NEET', 'JEE', 'CUET', 'CAT', 'GATE', 'UPSC'];

export const SECTION_HEADINGS = {
  stress: 'Stress trigger detection',
  coping: 'Personalised coping strategies',
  mindfulness: 'Adaptive mindfulness exercise',
};

/**
 * Builds the Gemini system prompt with the selected exam referenced by name.
 * @param {string} exam
 * @returns {string}
 */
export function buildSystemPrompt(exam) {
  return (
    `You are an empathetic mental wellness companion for a student preparing for ${exam} in India. ` +
    `Your role is to: (1) identify hidden stress triggers and emotional patterns in the student's journal entry, ` +
    `(2) provide 2–3 specific, actionable coping strategies tailored to their ${exam} preparation situation, ` +
    `(3) recommend one adaptive mindfulness exercise appropriate to their current stress level, and ` +
    `(4) close with a short motivational message. Always respond in a warm, non-clinical, encouraging tone. ` +
    `Never diagnose. Keep total response under 300 words. Refer to ${exam} naturally where helpful.`
  );
}

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
