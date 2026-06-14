import { STORAGE_KEYS } from '../constants';

export const DEFAULT_PROFILE = {
  userName: '',
  userAge: '',
  selectedExam: 'NEET',
  prepStage: 'Just started',
  achievement: '',
  challenge: '',
  motivation: '',
  examDate: '',
  onboardingComplete: false,
  highContrast: false,
  dyslexiaFont: false,
};

export function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.profile);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile) {
  const next = { ...loadProfile(), ...profile };
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(next));
  return next;
}

export function isValidUserName(name) {
  return typeof name === 'string' && name.trim().length >= 2;
}

export function isValidUserAge(age) {
  const value = Number(age);
  return Number.isInteger(value) && value >= 13 && value <= 100;
}

export function loadCheckIns() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.checkIns) ?? '[]');
  } catch {
    return [];
  }
}

export function saveCheckIn(entry) {
  const checkIns = [entry, ...loadCheckIns()];
  localStorage.setItem(STORAGE_KEYS.checkIns, JSON.stringify(checkIns));
  return checkIns;
}

export function loadJournals() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.journals) ?? '[]');
  } catch {
    return [];
  }
}

export function saveJournal(entry) {
  const journals = [entry, ...loadJournals()];
  localStorage.setItem(STORAGE_KEYS.journals, JSON.stringify(journals));
  return journals;
}

export function loadChatMessages() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.chat) ?? '[]');
  } catch {
    return [];
  }
}

export function saveChatMessages(messages) {
  localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(messages));
}

export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}
