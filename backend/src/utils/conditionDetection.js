function getCategoryScores(responses = {}) {
  const buckets = {
    emotional: [],
    behavioral: [],
    cognitive: [],
    social: [],
  };

  for (const [questionId, value] of Object.entries(responses)) {
    if (typeof value !== 'number') continue;
    const prefix = questionId?.[0];
    if (prefix === 'e') buckets.emotional.push(value);
    if (prefix === 'b') buckets.behavioral.push(value);
    if (prefix === 'c') buckets.cognitive.push(value);
    if (prefix === 's') buckets.social.push(value);
  }

  const average = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 3);

  return {
    emotional: average(buckets.emotional),
    behavioral: average(buckets.behavioral),
    cognitive: average(buckets.cognitive),
    social: average(buckets.social),
  };
}

function pushCondition(conditions, key, name) {
  if (!conditions.some((item) => item.key === key)) {
    conditions.push({ key, name });
  }
}

export function inferConditionsFromResponses(responses = {}) {
  const scores = getCategoryScores(responses);
  const conditions = [];

  if (scores.emotional < 2.5 && scores.behavioral < 2.5) {
    pushCondition(conditions, 'anxiety', 'Anxiety');
  } else if (scores.emotional < 3 || scores.behavioral < 3) {
    pushCondition(conditions, 'anxiety', 'Anxiety');
  }

  if (scores.emotional < 2.5 && scores.cognitive < 2.5) {
    pushCondition(conditions, 'depression', 'Depression');
  }

  if (scores.cognitive < 2.5 && scores.behavioral < 2.5) {
    pushCondition(conditions, 'adhd', 'ADHD');
  }

  if (scores.behavioral < 2.5) {
    pushCondition(conditions, 'sleep_disorder', 'Sleep Issues');
  }

  if (scores.emotional < 2.5) {
    pushCondition(conditions, 'low_self_esteem', 'Low Self-Esteem');
  }

  if (scores.social < 2.5) {
    pushCondition(conditions, 'social_anxiety', 'Social Anxiety');
  }

  if (scores.social < 3) {
    pushCondition(conditions, 'social_isolation', 'Social Isolation');
  }

  if (scores.behavioral < 2.5) {
    pushCondition(conditions, 'behavioral_issues', 'Behavioral Issues');
  }

  return conditions.slice(0, 3);
}

export function normalizeConditionKey(condition) {
  if (!condition) return null;

  const raw = typeof condition === 'string'
    ? condition
    : condition.key || condition?.condition?.key || condition?.condition?.shortName || condition?.condition?.name || condition?.name || '';

  const key = String(raw).toLowerCase();

  if (key.includes('adhd')) return 'adhd';
  if (key.includes('depress')) return 'depression';
  if (key.includes('social anxiety')) return 'social_anxiety';
  if (key.includes('social isolation') || key.includes('loneliness')) return 'social_isolation';
  if (key.includes('behavioral')) return 'behavioral_issues';
  if (key.includes('sleep')) return 'sleep_disorder';
  if (key.includes('esteem')) return 'low_self_esteem';
  if (key.includes('anxiety')) return 'anxiety';

  return null;
}
