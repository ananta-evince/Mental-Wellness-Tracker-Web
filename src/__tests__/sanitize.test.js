import { describe, it, expect } from 'vitest';
import { sanitiseInput, parseGeminiResponse } from '../utils/sanitize';
import { MAX_JOURNAL_LENGTH } from '../constants';

describe('sanitiseInput', () => {
  it('strips HTML tags', () => {
    expect(sanitiseInput('<b>Hello</b> world')).toBe('Hello world');
  });

  it('truncates to 2000 characters', () => {
    expect(sanitiseInput('x'.repeat(MAX_JOURNAL_LENGTH + 50)).length).toBe(MAX_JOURNAL_LENGTH);
  });
});

describe('parseGeminiResponse', () => {
  it('parses paragraph-based responses', () => {
    const sections = parseGeminiResponse(
      'Stress found.\n\n1. Take breaks\n\nBreathe.\n\nYou have got this!'
    );
    expect(sections.stressAnalysis).toBeTruthy();
    expect(sections.copingStrategies).toMatch(/breaks/i);
  });
});
