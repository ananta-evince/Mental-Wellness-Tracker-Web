/**
 * Validates mood score is an integer between 1 and 10.
 * @param {unknown} moodScore
 * @returns {boolean}
 */
export function isValidMoodScore(moodScore) {
  return Number.isInteger(moodScore) && moodScore >= 1 && moodScore <= 10;
}
