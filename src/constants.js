export const APP_NAME = 'Lumina';

export const APP_TAGLINE =
  'Your AI wellness companion for exam preparation. Let\u2019s get to know each other so I can support you better.';

export const APP_DESCRIPTION =
  'AI-powered mental wellness assistant for students preparing for NEET, JEE, CUET, CAT, GATE, UPSC, and Board Exams.';

export const APP_LOGO = '✨';

export const STORAGE_KEYS = {
  profile: 'lumina-profile',
  checkIns: 'lumina-checkins',
  journals: 'lumina-journals',
  chat: 'lumina-chat',
};

export const EXAMS = ['NEET', 'JEE', 'CUET', 'CAT', 'GATE', 'UPSC', 'Board Exams'];

export const EXAM_META = {
  NEET: { tagline: 'Medical entrance', emoji: '🩺' },
  JEE: { tagline: 'Engineering prep', emoji: '⚙️' },
  CUET: { tagline: 'University admissions', emoji: '🎓' },
  CAT: { tagline: 'MBA pathway', emoji: '📊' },
  GATE: { tagline: 'Post-grad tech', emoji: '🔬' },
  UPSC: { tagline: 'Civil services', emoji: '🏛️' },
  'Board Exams': { tagline: 'Class 10 & 12 boards', emoji: '📚' },
};

export const PREP_STAGES = ['Just started', 'Mid preparation', 'Final months', 'Re-attempting'];

export const CHECKIN_METRICS = [
  { id: 'energy', label: 'Energy', emoji: '⚡', gradient: 'from-rose-500 to-amber-500' },
  { id: 'stress', label: 'Stress Level', emoji: '😰', gradient: 'from-blue-500 to-emerald-500' },
  { id: 'confidence', label: 'Confidence', emoji: '💪', gradient: 'from-emerald-500 to-red-500' },
  { id: 'sleepQuality', label: 'Sleep Quality', emoji: '😴', gradient: 'from-violet-500 to-amber-500' },
  { id: 'studySatisfaction', label: 'Study Satisfaction', emoji: '📖', gradient: 'from-indigo-500 to-sky-400' },
];

export const JOURNAL_PROMPTS = [
  'How are you feeling about your preparation today?',
  'What challenged you today? What went well?',
  'What would you tell a friend in your situation?',
  'What are you grateful for right now?',
  'Is anything weighing on your mind?',
];

export const EXERCISES = [
  {
    id: 'breath-478',
    title: '4-7-8 Breathing',
    icon: '🌬️',
    duration: '2 min',
    description: 'Calm your nervous system in 2 minutes',
    pattern: { inhale: 4, hold: 7, exhale: 8 },
  },
  {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Grounding',
    icon: '🌍',
    duration: '3 min',
    description: 'Come back to the present moment',
    steps: [
      'Name 5 things you can see',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste',
    ],
  },
  {
    id: 'focus-reset',
    title: 'Focus Recovery',
    icon: '🎯',
    duration: '2 min',
    description: 'Reset your concentration with mindfulness',
    steps: [
      'Close your eyes and take 3 deep breaths',
      'Notice where your mind wandered without judgment',
      'Set one small, clear goal for the next 25 minutes',
      'Begin with a single easy task to rebuild momentum',
    ],
  },
  {
    id: 'pre-exam-calm',
    title: 'Pre-Exam Calm',
    icon: '📝',
    duration: '3 min',
    description: 'Reduce test anxiety before an exam',
    steps: [
      'Sit comfortably and unclench your jaw and shoulders',
      'Breathe in for 4 counts, out for 6 counts — repeat 5 times',
      'Remind yourself: preparation matters, perfection does not',
      'Visualize yourself reading the paper calmly and starting with what you know',
    ],
  },
  {
    id: 'sleep-wind-down',
    title: 'Sleep Wind-Down',
    icon: '🌙',
    duration: '5 min',
    description: 'Prepare your mind for restful sleep',
    steps: [
      'Dim screens and put your phone away',
      'Write down tomorrow\'s top 3 tasks to clear your mind',
      'Do a slow body scan from toes to head, relaxing each area',
      'Take 10 slow breaths, counting each exhale',
    ],
  },
  {
    id: 'body-scan',
    title: 'Quick Body Scan',
    icon: '🧘',
    duration: '3 min',
    description: 'Release physical tension from study posture',
    steps: [
      'Roll your shoulders back and down',
      'Stretch your neck gently side to side',
      'Notice tension in your jaw, hands, and lower back',
      'Breathe into each tense area and release on the exhale',
    ],
  },
];

export const APP_PAGES = {
  HOME: 'home',
  CHECK_IN: 'check-in',
  JOURNAL: 'journal',
  DASHBOARD: 'dashboard',
  EXERCISES: 'exercises',
  CHAT: 'chat',
  SETTINGS: 'settings',
};

export const NAV_ITEMS = [
  { pageId: APP_PAGES.HOME, label: 'Home', icon: '🏠' },
  { pageId: APP_PAGES.CHECK_IN, label: 'Check-in', icon: '✅' },
  { pageId: APP_PAGES.JOURNAL, label: 'Journal', icon: '📔' },
  { pageId: APP_PAGES.DASHBOARD, label: 'Dashboard', icon: '📊' },
  { pageId: APP_PAGES.EXERCISES, label: 'Exercises', icon: '🧘' },
  { pageId: APP_PAGES.CHAT, label: `Talk to ${APP_NAME}`, icon: '💬' },
  { pageId: APP_PAGES.SETTINGS, label: 'Settings', icon: '⚙️' },
];

export const MOBILE_NAV_ITEMS = [
  { pageId: APP_PAGES.HOME, label: 'Home', icon: '🏠' },
  { pageId: APP_PAGES.CHECK_IN, label: 'Check-in', icon: '✅' },
  { pageId: APP_PAGES.JOURNAL, label: 'Journal', icon: '📔' },
  { pageId: APP_PAGES.DASHBOARD, label: 'Stats', icon: '📊' },
  { pageId: APP_PAGES.CHAT, label: 'Chat', icon: '💬' },
];

export const MAX_JOURNAL_LENGTH = 2000;
export const CHAR_LIMIT_WARNING_RATIO = 0.9;
export const MIN_MOOD = 1;
export const MAX_MOOD = 10;
export const REQUEST_TIMEOUT_MS = 30000;
export const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];
export const GEMINI_MODEL = GEMINI_MODELS[0];
export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
export const GEMINI_PROXY_URL = '/api/gemini';
export const MIN_CALL_INTERVAL_MS = 2000;

export const SECTION_HEADINGS = {
  stress: 'Emotional Signals',
  coping: 'Academic Signals',
  mindfulness: 'Environmental Signals',
};

export const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'self-harm', 'hurt myself',
];

export const HELPLINES = [
  { name: 'Vandrevala Foundation', number: '1860-2662-345', hours: 'Mon–Sat, 8am–10pm' },
  { name: 'NIMHANS', number: '080-46110007', hours: '24/7' },
];

export const CRISIS_HELPLINES = HELPLINES.map((h) => ({
  name: h.name,
  phone: h.number,
  hours: h.hours,
}));

/**
 * @param {string} exam
 * @param {{ userName?: string, userAge?: string }} [profile]
 */
export function buildSystemPrompt(exam, profile = {}) {
  const { userName = '', userAge = '' } = profile;
  const { stress, coping, mindfulness } = SECTION_HEADINGS;
  const studentContext = [
    userName ? `The student's name is ${userName}.` : '',
    userAge ? `They are ${userAge} years old.` : '',
  ].filter(Boolean).join(' ');

  return (
    `You are ${APP_NAME}, an empathetic AI wellness companion for a student preparing for ${exam} in India. ` +
    `${studentContext} ` +
    `Analyze their journal/check-in and respond with: (1) ${stress} — emotional patterns and triggers, ` +
    `(2) ${coping} — academic/preparation related observations, (3) ${mindfulness} — environmental or lifestyle factors, ` +
    `(4) A short warm motivational close. Warm, non-clinical tone. Under 300 words. Never diagnose. ` +
    `Use exact headings:\n## ${stress}\n## ${coping}\n## ${mindfulness}\n## A note for you`
  );
}

export function buildChatSystemPrompt(exam, userName = '') {
  return (
    `You are ${APP_NAME}, a warm AI wellness companion for a student preparing for ${exam}. ` +
    `${userName ? `The student's name is ${userName}.` : ''} ` +
    `Listen empathetically, offer brief supportive responses (2-4 sentences), and suggest practical coping tips when appropriate. ` +
    `Never diagnose. If they express crisis or self-harm, gently encourage contacting Vandrevala Foundation (1860-2662-345) or NIMHANS (080-46110007).`
  );
}

export const MOOD_EMOJIS = { 1: '😰', 2: '😔', 3: '😟', 4: '😕', 5: '😐', 6: '🙂', 7: '😊', 8: '😄', 9: '😁', 10: '🌟' };
export const MOOD_LABELS = {
  1: 'Very low', 2: 'Low', 3: 'Struggling', 4: 'Uneasy', 5: 'Neutral',
  6: 'Okay', 7: 'Good', 8: 'Bright', 9: 'Great', 10: 'Excellent',
};
export const MOOD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const MOOD_SCALE_MIDPOINT = 5;
export const SPARKLINE_WINDOW = 7;
