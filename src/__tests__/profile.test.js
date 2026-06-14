import { describe, it, expect, afterEach } from 'vitest';
import {
  loadProfile,
  saveProfile,
  isValidUserName,
  isValidUserAge,
} from '../utils/profile';
import { STORAGE_KEYS } from '../constants';

describe('profile utils', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('loads default profile when storage is empty', () => {
    localStorage.clear();
    expect(loadProfile().onboardingComplete).toBe(false);
  });

  it('persists profile updates', () => {
    saveProfile({ userName: 'Riya', userAge: '18', onboardingComplete: true });
    const profile = loadProfile();
    expect(profile.userName).toBe('Riya');
    expect(profile.userAge).toBe('18');
    expect(profile.onboardingComplete).toBe(true);
  });

  it('validates user name and age', () => {
    expect(isValidUserName('An')).toBe(true);
    expect(isValidUserName('A')).toBe(false);
    expect(isValidUserAge(17)).toBe(true);
    expect(isValidUserAge(12)).toBe(false);
  });

  it('uses lumina storage key', () => {
    saveProfile({ userName: 'Test' });
    expect(localStorage.getItem(STORAGE_KEYS.profile)).toContain('Test');
  });
});
