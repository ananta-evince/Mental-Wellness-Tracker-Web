import { EXAMS, MAX_MOOD, MIN_MOOD } from '../constants';
import { sanitiseInput } from './sanitize';

/**
 * Validates mood score is an integer between MIN_MOOD and MAX_MOOD.
 * @param {unknown} moodScore
 * @returns {boolean}
 */
export function isValidMoodScore(moodScore) {
  return Number.isInteger(moodScore) && moodScore >= MIN_MOOD && moodScore <= MAX_MOOD;
}

/**
 * Validates exam name against the allowed whitelist.
 * @param {unknown} exam
 * @returns {boolean}
 */
export function isValidExam(exam) {
  return typeof exam === 'string' && EXAMS.includes(exam);
}

/**
 * Validates journal text and mood selection before check-in submission.
 * @param {string} journalText
 * @param {number | null} selectedMood
 * @returns {{
 *   sanitised: string,
 *   journalError: string | null,
 *   moodError: string | null,
 *   isValid: boolean
 * }}
 */
export function validateCheckInFields(journalText, selectedMood) {
  const sanitised = sanitiseInput(journalText);
  const journalError = sanitised
    ? null
    : 'Please write at least a few words before submitting.';
  const moodError =
    selectedMood === null
      ? 'Please select how you are feeling on the mood scale.'
      : !isValidMoodScore(selectedMood)
        ? 'Please select how you are feeling on the mood scale.'
        : null;

  return {
    sanitised,
    journalError,
    moodError,
    isValid: !journalError && !moodError,
  };
}
