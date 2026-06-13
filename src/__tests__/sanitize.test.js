import { describe, it, expect } from 'vitest';
import { sanitiseInput, parseGeminiResponse } from '../utils/sanitize';
import { MAX_JOURNAL_LENGTH, SECTION_HEADINGS } from '../constants';

describe('sanitiseInput', () => {
  it('strips HTML tags', () => {
    expect(sanitiseInput('<b>Hello</b> world')).toBe('Hello world');
  });

  it('strips control characters', () => {
    expect(sanitiseInput('Hello\x00world')).toBe('Helloworld');
  });

  it('truncates to 2000 characters', () => {
    expect(sanitiseInput('x'.repeat(MAX_JOURNAL_LENGTH + 50)).length).toBe(MAX_JOURNAL_LENGTH);
  });
});

describe('parseGeminiResponse', () => {
  it('parses exact section headings from system prompt', () => {
    const raw = [
      `## ${SECTION_HEADINGS.stress}`,
      'Mock test anxiety is a trigger.',
      `## ${SECTION_HEADINGS.coping}`,
      '1. Walk for 10 minutes\n2. Sleep by 11pm',
      `## ${SECTION_HEADINGS.mindfulness}`,
      'Try 4-7-8 breathing for two minutes.',
      '## A note for you',
      'You are closer than you think.',
    ].join('\n');

    const sections = parseGeminiResponse(raw);

    expect(sections.stressAnalysis).toMatch(/mock test anxiety/i);
    expect(sections.copingStrategies).toMatch(/walk/i);
    expect(sections.mindfulnessExercise).toMatch(/breathing/i);
    expect(sections.motivationalMessage).toMatch(/closer than you think/i);
  });

  it('falls back to paragraph parsing', () => {
    const sections = parseGeminiResponse(
      'Stress found.\n\n1. Take breaks\n\nBreathe.\n\nYou have got this!'
    );
    expect(sections.stressAnalysis).toBeTruthy();
    expect(sections.copingStrategies).toMatch(/breaks/i);
  });
});
