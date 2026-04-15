/**
 * Streak utilities - Daily login streak for Wellness
 */

const STORAGE_KEY = 'mental-pro-streak';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getStoredStreak() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { lastDate: null, streak: 0 };
  } catch {
    return { lastDate: null, streak: 0 };
  }
}

export function recordDailyVisit(userId) {
  const key = `${STORAGE_KEY}-${userId || 'default'}`;
  const today = getTodayKey();
  let { lastDate, streak } = (() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : { lastDate: null, streak: 0 };
    } catch {
      return { lastDate: null, streak: 0 };
    }
  })();

  if (lastDate === today) return { streak, isNewDay: false };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (!lastDate) {
    streak = 1;
  } else if (lastDate === yesterdayKey) {
    streak += 1;
  } else {
    streak = 1;
  }

  const data = { lastDate: today, streak };
  localStorage.setItem(key, JSON.stringify(data));
  return { streak, isNewDay: true };
}

export function getStreak(userId) {
  const key = `${STORAGE_KEY}-${userId || 'default'}`;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return 0;
    const { lastDate, streak } = JSON.parse(stored);
    return streak;
  } catch {
    return 0;
  }
}
