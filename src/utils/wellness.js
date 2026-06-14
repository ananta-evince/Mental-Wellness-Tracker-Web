/**
 * @param {Array<object>} checkIns
 */
export function computeWellnessStats(checkIns) {
  if (checkIns.length === 0) {
    return {
      avgMood: null,
      avgStress: null,
      avgSleep: null,
      avgConfidence: null,
      avgEnergy: null,
      burnoutScore: null,
      burnoutLabel: 'Complete your first check-in to get a personalized burnout score.',
      streak: 0,
      longestStreak: 0,
    };
  }

  const metric = (c, key) => c.metrics?.[key] ?? c[key] ?? 0;

  const avg = (key) => {
    const sum = checkIns.reduce((acc, c) => acc + metric(c, key), 0);
    return (sum / checkIns.length).toFixed(1);
  };

  const avgEnergy = Number(avg('energy'));
  const avgStress = Number(avg('stress'));
  const avgSleep = Number(avg('sleepQuality'));
  const avgConfidence = Number(avg('confidence'));
  const avgMood = Number(avg('studySatisfaction'));

  let burnoutScore = 0;
  if (avgStress >= 7) burnoutScore += 30;
  else if (avgStress >= 5) burnoutScore += 15;
  if (avgEnergy <= 4) burnoutScore += 25;
  else if (avgEnergy <= 6) burnoutScore += 10;
  if (avgSleep <= 4) burnoutScore += 25;
  else if (avgSleep <= 6) burnoutScore += 10;
  if (avgConfidence <= 4) burnoutScore += 20;
  else if (avgConfidence <= 6) burnoutScore += 10;

  burnoutScore = Math.min(100, burnoutScore);

  let burnoutLabel = "You're doing well! Keep maintaining your balance.";
  if (burnoutScore >= 60) burnoutLabel = 'Your wellness needs attention. Take more breaks and focus on sleep.';
  else if (burnoutScore >= 35) burnoutLabel = 'Some stress signals detected. Consider mindfulness exercises.';

  const dates = [...new Set(checkIns.map((c) => (c.timestamp || c.date || '').slice(0, 10)))].sort();
  let streak = 0;
  let longestStreak = 0;
  let current = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (let i = dates.length - 1; i >= 0; i -= 1) {
    const expected = new Date();
    expected.setDate(expected.getDate() - (dates.length - 1 - i));
    if (dates[i] === expected.toISOString().slice(0, 10)) {
      current += 1;
      longestStreak = Math.max(longestStreak, current);
    } else {
      current = 1;
    }
  }

  if (dates.includes(today)) {
    streak = 1;
    for (let d = 1; d < 365; d += 1) {
      const prev = new Date();
      prev.setDate(prev.getDate() - d);
      if (dates.includes(prev.toISOString().slice(0, 10))) streak += 1;
      else break;
    }
  }

  return {
    avgMood,
    avgStress,
    avgSleep,
    avgConfidence,
    avgEnergy,
    burnoutScore,
    burnoutLabel,
    streak,
    longestStreak,
  };
}

/**
 * @returns {string}
 */
export function getGreeting(name = '') {
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 22 || hour < 5) greeting = hour < 5 ? 'Hey night owl' : 'Good night';

  return name ? `${greeting}, ${name}` : greeting;
}

/**
 * @param {string} examDate ISO date string
 */
export function getExamCountdown(examDate) {
  if (!examDate) return null;
  const diff = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export function detectCrisis(text) {
  const lower = text.toLowerCase();
  return ['suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'self-harm', 'hurt myself'].some(
    (kw) => lower.includes(kw)
  );
}
