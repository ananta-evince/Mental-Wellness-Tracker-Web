import { describe, it, expect } from 'vitest';
import { isValidExam, isValidMoodScore, validateCheckInFields } from '../utils/validation';

describe('isValidMoodScore', () => {
  it('accepts integers 1 through 10', () => {
    for (let mood = 1; mood <= 10; mood += 1) {
      expect(isValidMoodScore(mood)).toBe(true);
    }
  });

  it('rejects out-of-range and non-integer values', () => {
    expect(isValidMoodScore(0)).toBe(false);
    expect(isValidMoodScore(11)).toBe(false);
    expect(isValidMoodScore(5.5)).toBe(false);
    expect(isValidMoodScore(null)).toBe(false);
    expect(isValidMoodScore('5')).toBe(false);
  });
});

describe('isValidExam', () => {
  it('accepts whitelisted exam names', () => {
    expect(isValidExam('NEET')).toBe(true);
    expect(isValidExam('JEE')).toBe(true);
    expect(isValidExam('UPSC')).toBe(true);
  });

  it('rejects unknown or invalid exam values', () => {
    expect(isValidExam('SAT')).toBe(false);
    expect(isValidExam('')).toBe(false);
    expect(isValidExam(null)).toBe(false);
    expect(isValidExam('<script>NEET</script>')).toBe(false);
  });
});

describe('validateCheckInFields', () => {
  it('returns valid result for complete check-in', () => {
    const result = validateCheckInFields('Feeling stressed about mocks', 7);
    expect(result.isValid).toBe(true);
    expect(result.journalError).toBeNull();
    expect(result.moodError).toBeNull();
    expect(result.sanitised).toBe('Feeling stressed about mocks');
  });

  it('returns journal error for empty input', () => {
    const result = validateCheckInFields('   ', null);
    expect(result.isValid).toBe(false);
    expect(result.journalError).toMatch(/few words/i);
    expect(result.moodError).toMatch(/mood scale/i);
  });

  it('returns mood error when mood is not selected', () => {
    const result = validateCheckInFields('Valid journal entry here', null);
    expect(result.isValid).toBe(false);
    expect(result.journalError).toBeNull();
    expect(result.moodError).toMatch(/mood scale/i);
  });

  it('sanitises journal text before validation', () => {
    const result = validateCheckInFields('<b>Hello</b> world', 5);
    expect(result.sanitised).toBe('Hello world');
    expect(result.isValid).toBe(true);
  });
});
