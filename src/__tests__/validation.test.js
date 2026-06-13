import { describe, it, expect } from 'vitest';
import { isValidMoodScore } from '../utils/validation';

describe('isValidMoodScore', () => {
  it('accepts integers 1 through 10', () => {
    for (let i = 1; i <= 10; i += 1) {
      expect(isValidMoodScore(i)).toBe(true);
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
