export const MAX_JOURNAL_LENGTH = 2000;

export const CHAR_LIMIT_WARNING_RATIO = 0.9;

export const MIN_MOOD = 1;

export const MAX_MOOD = 10;

export const MOOD_SCALE_MIDPOINT = 5;

export const MOOD_VALUES = Array.from(
  { length: MAX_MOOD - MIN_MOOD + 1 },
  (_, index) => MIN_MOOD + index
);

export const SPARKLINE_WINDOW = 7;

export const REQUEST_TIMEOUT_MS = 30000;

export const GEMINI_MODEL = 'gemini-flash-latest';

export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** Client-side proxy endpoint — API key never leaves the server. */
export const GEMINI_PROXY_URL = '/api/gemini';

export const MIN_CALL_INTERVAL_MS = 2000;

export const EXAMS = ['NEET', 'JEE', 'CUET', 'CAT', 'GATE', 'UPSC'];

export const EXAM_META = {
  NEET: { tagline: 'Medical entrance', emoji: '🩺' },
  JEE: { tagline: 'Engineering prep', emoji: '⚙️' },
  CUET: { tagline: 'University admissions', emoji: '🎓' },
  CAT: { tagline: 'MBA pathway', emoji: '📊' },
  GATE: { tagline: 'Post-grad tech', emoji: '🔬' },
  UPSC: { tagline: 'Civil services', emoji: '🏛️' },
};

export const SECTION_HEADINGS = {
  stress: 'Stress trigger detection',
  coping: 'Personalised coping strategies',
  mindfulness: 'Adaptive mindfulness exercise',
};

export const FEATURE_PILLS = ['Daily journaling', 'Mood tracking', 'AI insights', 'Mindfulness'];

export const APP_PAGES = {
  EXAM_JOURNEY: 'exam-journey',
  CHECK_IN: 'check-in',
  INSIGHTS: 'insights',
  HISTORY: 'history',
};

export const SIDEBAR_NAV_ITEMS = [
  { pageId: APP_PAGES.EXAM_JOURNEY, label: 'Your exam journey', icon: '🎯' },
  { pageId: APP_PAGES.CHECK_IN, label: "Today's check-in", icon: '✍️' },
  { pageId: APP_PAGES.INSIGHTS, label: 'Your personalised support', icon: '✨' },
  { pageId: APP_PAGES.HISTORY, label: 'Your journey so far', icon: '📔' },
];

/**
 * Builds the Gemini system prompt with the selected exam referenced by name.
 * @param {string} exam
 * @returns {string}
 */
export function buildSystemPrompt(exam) {
  const { stress, coping, mindfulness } = SECTION_HEADINGS;

  return (
    `You are an empathetic mental wellness companion for a student preparing for ${exam} in India. ` +
    `Your role is to: (1) identify hidden stress triggers and emotional patterns in the student's journal entry, ` +
    `(2) provide 2–3 specific, actionable coping strategies tailored to their ${exam} preparation situation, ` +
    `(3) recommend one adaptive mindfulness exercise appropriate to their current stress level, and ` +
    `(4) close with a short motivational message. Always respond in a warm, non-clinical, encouraging tone. ` +
    `Never diagnose. Keep total response under 300 words. Refer to ${exam} naturally where helpful. ` +
    `Format your reply using these exact section headings on separate lines:\n` +
    `## ${stress}\n` +
    `## ${coping}\n` +
    `## ${mindfulness}\n` +
    `## A note for you`
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
