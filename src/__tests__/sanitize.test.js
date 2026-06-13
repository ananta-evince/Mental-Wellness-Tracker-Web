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

  it('strips javascript protocol patterns', () => {
    expect(sanitiseInput('javascript:alert(1)')).toBe('alert(1)');
  });

  it('strips vbscript protocol patterns', () => {
    expect(sanitiseInput('vbscript:msgbox(1)')).toBe('msgbox(1)');
  });

  it('strips inline event handlers', () => {
    expect(sanitiseInput('onclick=alert(1) hello')).toBe('alert(1) hello');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitiseInput(null)).toBe('');
    expect(sanitiseInput(undefined)).toBe('');
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

  it('parses markdown bold headers', () => {
    const raw = [
      `**${SECTION_HEADINGS.stress}**`,
      'Pressure from mock tests.',
      `**${SECTION_HEADINGS.coping}**`,
      '1. Sleep early\n2. Walk daily',
      `**${SECTION_HEADINGS.mindfulness}**`,
      'Box breathing for 2 minutes.',
      '**A note for you**',
      'Keep going.',
    ].join('\n');

    const sections = parseGeminiResponse(raw);
    expect(sections.stressAnalysis).toMatch(/pressure/i);
    expect(sections.copingStrategies).toMatch(/sleep early/i);
  });

  it('falls back to paragraph parsing', () => {
    const sections = parseGeminiResponse(
      'Stress found.\n\n1. Take breaks\n\nBreathe deeply.\n\nYou have got this!'
    );
    expect(sections.stressAnalysis).toBeTruthy();
    expect(sections.copingStrategies).toMatch(/breaks/i);
    expect(sections.mindfulnessExercise).toMatch(/breathe/i);
    expect(sections.motivationalMessage).toMatch(/got this/i);
  });

  it('handles single paragraph response', () => {
    const sections = parseGeminiResponse('Single insight paragraph.');
    expect(sections.stressAnalysis).toBe('Single insight paragraph.');
  });

  it('handles empty response with fallback message', () => {
    const sections = parseGeminiResponse('');
    expect(sections.stressAnalysis).toMatch(/could not generate/i);
  });

  it('handles two-paragraph stress and motivation split', () => {
    const sections = parseGeminiResponse('Stress analysis here.\n\nYou are doing great!');
    expect(sections.stressAnalysis).toMatch(/stress analysis/i);
    expect(sections.motivationalMessage).toMatch(/doing great/i);
  });

  it('parses inline section headers ending with colon', () => {
    const raw = [
      '## Coping strategies:',
      '1. Rest well',
      '2. Eat healthy',
      '## Mindfulness exercise:',
      'Focus on breathing.',
    ].join('\n');

    const sections = parseGeminiResponse(raw);
    expect(sections.copingStrategies).toMatch(/rest well/i);
    expect(sections.mindfulnessExercise).toMatch(/breathing/i);
  });

  it('parses fuzzy markdown headers via label matching', () => {
    const raw = [
      '## Emotional patterns noticed',
      'You seem anxious before mocks.',
      '## Tips to try this week',
      '1. Sleep by 10pm',
      '## Grounding breath work',
      'Inhale for four counts.',
      '## Remember',
      'You are capable.',
    ].join('\n');

    const sections = parseGeminiResponse(raw);
    expect(sections.stressAnalysis).toMatch(/anxious/i);
    expect(sections.copingStrategies).toMatch(/sleep/i);
    expect(sections.mindfulnessExercise).toMatch(/inhale/i);
    expect(sections.motivationalMessage).toMatch(/capable/i);
  });

  it('assigns numbered list without coping keyword to strategies', () => {
    const sections = parseGeminiResponse(
      'General stress noted.\n\n1. Walk daily\n2. Drink water\n\nGround yourself slowly.\n\nKeep going!'
    );
    expect(sections.copingStrategies).toMatch(/walk daily/i);
    expect(sections.mindfulnessExercise).toMatch(/ground/i);
    expect(sections.motivationalMessage).toMatch(/keep going/i);
  });

  it('splits multi-paragraph text without special sections', () => {
    const sections = parseGeminiResponse(
      'First stress paragraph.\n\nSecond stress paragraph.\n\nFinal encouragement.'
    );
    expect(sections.stressAnalysis).toMatch(/first stress/i);
    expect(sections.motivationalMessage).toMatch(/encouragement/i);
  });
});
