import { describe, it, expect } from 'vitest';
import { parseGeminiResponse, sanitizeText } from '../utils/sanitize';
import { MAX_JOURNAL_LENGTH } from '../constants';

describe('sanitizeText', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });

  it('strips script tags and content', () => {
    expect(sanitizeText('<script>alert("x")</script>Hello')).toBe('Hello');
  });

  it('strips img tags with event handlers', () => {
    expect(sanitizeText('<img src=x onerror=alert(1)>Safe text')).toBe('Safe text');
  });

  it('removes javascript protocol', () => {
    expect(sanitizeText('javascript:alert(1)')).toBe('alert(1)');
  });

  it('trims and enforces max length', () => {
    const long = 'x'.repeat(MAX_JOURNAL_LENGTH + 100);
    expect(sanitizeText(`  ${long}  `).length).toBe(MAX_JOURNAL_LENGTH);
  });
});

describe('parseGeminiResponse', () => {
  it('parses markdown-style section headers', () => {
    const raw = [
      '## Stress patterns',
      'You seem worried about mock scores.',
      '',
      '## Coping strategies',
      '1. Walk for 10 minutes',
      '2. Review one topic only',
      '',
      '## Mindfulness exercise',
      'Box breathing for 2 minutes.',
      '',
      '## Motivational message',
      'You are closer than you think.',
    ].join('\n');

    const sections = parseGeminiResponse(raw);

    expect(sections.stressAnalysis).toMatch(/mock scores/i);
    expect(sections.copingStrategies).toMatch(/walk/i);
    expect(sections.mindfulnessExercise).toMatch(/box breathing/i);
    expect(sections.motivationalMessage).toMatch(/closer than you think/i);
  });

  it('falls back to paragraph parsing', () => {
    const raw =
      'I notice pressure building.\n\n1. Take breaks\n2. Sleep early\n\nTry deep breathing.\n\nYou have got this!';

    const sections = parseGeminiResponse(raw);

    expect(sections.stressAnalysis).toBeTruthy();
    expect(sections.copingStrategies).toMatch(/breaks/i);
    expect(sections.mindfulnessExercise).toMatch(/breathing/i);
    expect(sections.motivationalMessage).toMatch(/got this/i);
  });

  it('handles single paragraph response', () => {
    const sections = parseGeminiResponse('Single supportive paragraph.');
    expect(sections.stressAnalysis).toBe('Single supportive paragraph.');
  });

  it('returns fallback for empty input', () => {
    const sections = parseGeminiResponse('');
    expect(sections.stressAnalysis).toMatch(/could not generate/i);
  });
});
