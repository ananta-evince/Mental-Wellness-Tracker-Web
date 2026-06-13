import { MAX_JOURNAL_LENGTH, SECTION_HEADINGS } from '../constants';

const EXACT_HEADING_MAP = {
  [SECTION_HEADINGS.stress.toLowerCase()]: 'stressAnalysis',
  [SECTION_HEADINGS.coping.toLowerCase()]: 'copingStrategies',
  [SECTION_HEADINGS.mindfulness.toLowerCase()]: 'mindfulnessExercise',
  'a note for you': 'motivationalMessage',
};

const SECTION_PATTERNS = [
  { key: 'stressAnalysis', labels: ['stress', 'emotional', 'pattern', 'trigger', 'notice', 'hidden'] },
  { key: 'copingStrategies', labels: ['coping', 'strateg', 'action', 'tip', 'try this'] },
  { key: 'mindfulnessExercise', labels: ['mindful', 'breath', 'exercise', 'meditat', 'focus', 'ground'] },
  { key: 'motivationalMessage', labels: ['motivat', 'encourag', 'note for you', 'remember', 'believe', 'proud'] },
];

/**
 * Removes ASCII control characters from user text.
 * @param {string} text
 */
function stripControlChars(text) {
  let result = '';
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code >= 32 && code !== 127) result += text[i];
  }
  return result;
}

/**
 * Strips HTML tags, control characters, and truncates journal text before API calls.
 * @param {string} text
 * @returns {string}
 */
export function sanitiseInput(text) {
  if (typeof text !== 'string') return '';

  return stripControlChars(text.replace(/<[^>]*>/g, '').replace(/javascript:/gi, ''))
    .trim()
    .slice(0, MAX_JOURNAL_LENGTH);
}

/**
 * Parses Gemini response into labelled sections for display.
 * @param {string} rawText
 */
export function parseGeminiResponse(rawText) {
  const fallback =
    rawText?.trim() || 'We could not generate insights right now. Please try again in a moment.';

  const exactSections = parseExactHeadings(fallback);
  const filledExact = Object.values(exactSections).filter(Boolean).length;
  if (filledExact >= 2) return exactSections;

  const hasMarkdownHeaders =
    /^#{1,3}\s/m.test(fallback) || /^\*\*[^*]+\*\*:?\s*$/m.test(fallback);

  if (hasMarkdownHeaders) {
    const sections = parseGeminiResponseFromHeaders(fallback);
    if (Object.values(sections).filter(Boolean).length >= 2) return sections;
  }

  return parseGeminiResponseByParagraphs(fallback, {
    stressAnalysis: '',
    copingStrategies: '',
    mindfulnessExercise: '',
    motivationalMessage: '',
  });
}

/**
 * Parses responses that use the exact SECTION_HEADINGS from the system prompt.
 * @param {string} text
 */
function parseExactHeadings(text) {
  const sections = {
    stressAnalysis: '',
    copingStrategies: '',
    mindfulnessExercise: '',
    motivationalMessage: '',
  };

  const lines = text.split('\n');
  let currentKey = null;
  const buffers = { stressAnalysis: [], copingStrategies: [], mindfulnessExercise: [], motivationalMessage: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const heading = trimmed.replace(/^#{1,3}\s*/, '').replace(/^\*\*|\*\*$/g, '').trim();
    const exactKey = EXACT_HEADING_MAP[heading.toLowerCase()];

    if (exactKey) {
      currentKey = exactKey;
      continue;
    }

    if (currentKey) buffers[currentKey].push(trimmed);
    else buffers.stressAnalysis.push(trimmed);
  }

  for (const key of Object.keys(sections)) {
    if (buffers[key].length > 0) sections[key] = buffers[key].join('\n').trim();
  }

  return sections;
}

function matchSectionHeader(line) {
  const cleaned = line.replace(/^#+\s*/, '').replace(/^\*\*|\*\*$/g, '').trim();
  const exactKey = EXACT_HEADING_MAP[cleaned.toLowerCase()];
  if (exactKey) return { key: exactKey, body: '' };

  for (const section of SECTION_PATTERNS) {
    if (section.labels.some((label) => cleaned.toLowerCase().includes(label))) {
      const body = cleaned.replace(/^[\d.)]+\s*/, '').trim();
      return { key: section.key, body: body.length > cleaned.length / 2 ? '' : cleaned };
    }
  }
  return null;
}

function parseGeminiResponseFromHeaders(fallback) {
  const lines = fallback.split('\n');
  let currentKey = null;
  const buffers = {
    stressAnalysis: [],
    copingStrategies: [],
    mindfulnessExercise: [],
    motivationalMessage: [],
  };
  const sections = {
    stressAnalysis: '',
    copingStrategies: '',
    mindfulnessExercise: '',
    motivationalMessage: '',
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const headerMatch = /^#{1,3}\s/.test(trimmed) || /^\*\*[^*]+\*\*:?$/.test(trimmed)
      ? matchSectionHeader(trimmed)
      : null;

    if (headerMatch) {
      currentKey = headerMatch.key;
      if (headerMatch.body) buffers[currentKey].push(headerMatch.body);
      continue;
    }

    const inlineMatch = matchSectionHeader(trimmed);
    if (inlineMatch && trimmed.endsWith(':')) {
      currentKey = inlineMatch.key;
      continue;
    }

    if (currentKey) buffers[currentKey].push(trimmed);
    else buffers.stressAnalysis.push(trimmed);
  }

  for (const key of Object.keys(sections)) {
    if (buffers[key].length > 0) sections[key] = buffers[key].join('\n').trim();
  }

  return sections;
}

function parseGeminiResponseByParagraphs(fallback, sections) {
  const paragraphs = fallback.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  if (paragraphs.length === 0) {
    sections.stressAnalysis = fallback;
    return sections;
  }

  if (paragraphs.length === 1) {
    sections.stressAnalysis = paragraphs[0];
    return sections;
  }

  let copingIdx = paragraphs.findIndex(
    (p) =>
      /coping|strateg|tip|try|action/i.test(p) &&
      (/^\d[.)]/m.test(p) || /[-•*]/m.test(p))
  );

  if (copingIdx === -1) {
    copingIdx = paragraphs.findIndex((p) => /^\d[.)]/m.test(p) || /^[-•*]/m.test(p));
  }

  const mindfulnessIdx = paragraphs.findIndex(
    (p, i) =>
      i !== copingIdx &&
      /breath|mindful|meditat|focus|exercise|ground|inhale|pause/i.test(p)
  );

  const motivationIdx = paragraphs.findIndex(
    (p, i) =>
      i !== copingIdx &&
      i !== mindfulnessIdx &&
      /you've got|you have got|keep going|believe|proud|remember|you can|you're not alone|rooting|got this/i.test(p)
  );

  if (copingIdx === -1 && mindfulnessIdx === -1) {
    sections.stressAnalysis = paragraphs.slice(0, -1).join('\n\n') || paragraphs[0];
    sections.motivationalMessage = paragraphs[paragraphs.length - 1];
    return sections;
  }

  const firstSpecial = Math.min(
    ...[copingIdx, mindfulnessIdx, motivationIdx].filter((i) => i >= 0)
  );

  sections.stressAnalysis = paragraphs.slice(0, firstSpecial).join('\n\n');
  if (copingIdx >= 0) sections.copingStrategies = paragraphs[copingIdx];
  if (mindfulnessIdx >= 0) sections.mindfulnessExercise = paragraphs[mindfulnessIdx];
  sections.motivationalMessage =
    motivationIdx >= 0 ? paragraphs[motivationIdx] : paragraphs[paragraphs.length - 1];
  if (!sections.stressAnalysis) sections.stressAnalysis = paragraphs[0];

  return sections;
}
