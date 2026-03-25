/**
 * Mental Illness Identification System
 * Maps assessment responses to specific mental health conditions
 * with symptoms, tips, and recommendations
 */

export const MENTAL_CONDITIONS = {
  anxiety: {
    name: 'Anxiety Disorders',
    shortName: 'Anxiety',
    icon: '😰',
    description: 'Signs of excessive worry, nervousness, or fear',
    symptoms: [
      'Frequent worry or nervousness',
      'Difficulty relaxing',
      'Restlessness or fatigue',
      'Trouble concentrating',
    ],
    tips: [
      'Practice deep breathing exercises daily (try 5-4-3-2-1 grounding)',
      'Establish a consistent sleep schedule',
      'Limit caffeine and sugar intake',
      'Regular physical activity (30 mins daily)',
      'Talk to a trusted adult about worries',
      'Try mindfulness and meditation apps',
    ],
    professionalHelp: 'Cognitive Behavioral Therapy (CBT) is highly effective for anxiety',
  },
  depression: {
    name: 'Depression',
    shortName: 'Depression',
    icon: '😔',
    description: 'Signs of persistent sadness, hopelessness, or loss of interest',
    symptoms: [
      'Persistent sadness or low mood',
      'Loss of interest in activities',
      'Hopelessness or negative thoughts',
      'Changes in sleep or energy',
    ],
    tips: [
      'Engage in enjoyable activities daily',
      'Exercise regularly (improves mood)',
      'Maintain regular sleep schedule',
      'Spend time with supportive friends/family',
      'Practice gratitude (write 3 things daily)',
      'Seek social connection and support groups',
    ],
    professionalHelp: 'Professional counseling and therapy can help manage depression',
  },
  adhd: {
    name: 'ADHD (Attention-Deficit/Hyperactivity Disorder)',
    shortName: 'ADHD',
    icon: '⚡',
    description: 'Signs of difficulty with attention, concentration, or impulse control',
    symptoms: [
      'Difficulty focusing or maintaining attention',
      'Fidgeting or restlessness',
      'Trouble completing tasks',
      'Impulsive behavior',
      'Difficulty organizing or planning',
    ],
    tips: [
      'Break tasks into smaller, manageable steps',
      'Use timers and schedules to stay organized',
      'Minimize distractions (quiet study space)',
      'Regular physical activity to release energy',
      'Use checklists and visual reminders',
      'Practice mindfulness and breathing exercises',
      'Maintain consistent routines',
    ],
    professionalHelp: 'Professional evaluation and behavioral strategies are essential',
  },
  sleep_disorder: {
    name: 'Sleep Disorders',
    shortName: 'Sleep Issues',
    icon: '😴',
    description: 'Signs of sleep problems affecting daytime functioning',
    symptoms: [
      'Poor sleep quality or insomnia',
      'Excessive daytime fatigue',
      'Difficulty waking up',
      'Irregular sleep schedule',
    ],
    tips: [
      'Establish a consistent bedtime routine',
      'Limit screen time 1 hour before bed',
      'Keep bedroom cool, dark, and quiet',
      'Avoid caffeine after 2 PM',
      'Exercise during day (not before bed)',
      'Try relaxation techniques before sleep',
      'Avoid napping during day',
    ],
    professionalHelp: 'Sleep specialist or doctor can evaluate and help treat sleep issues',
  },
  low_self_esteem: {
    name: 'Low Self-Esteem',
    shortName: 'Low Self-Esteem',
    icon: '😞',
    description: 'Signs of negative self-image or lack of confidence',
    symptoms: [
      'Negative self-talk or self-criticism',
      'Lack of confidence in abilities',
      'Avoiding challenges or new situations',
      'Being overly critical of mistakes',
    ],
    tips: [
      'Practice positive self-talk and affirmations',
      'Set and achieve small realistic goals',
      'Focus on strengths and accomplishments',
      'Engage in activities you enjoy and are good at',
      'Practice self-compassion when making mistakes',
      'Spend time with supportive people',
      'Celebrate small wins and progress',
    ],
    professionalHelp: 'Therapy can help build confidence and positive self-image',
  },
  social_anxiety: {
    name: 'Social Anxiety',
    shortName: 'Social Anxiety',
    icon: '😳',
    description: 'Signs of anxiety or fear in social situations',
    symptoms: [
      'Fear of judgment or embarrassment',
      'Avoidance of social situations',
      'Difficulty making friends',
      'Anxiety in public or group settings',
    ],
    tips: [
      'Start with small social interactions',
      'Practice social skills with trusted people',
      'Join clubs or groups with shared interests',
      'Use breathing exercises before social events',
      'Challenge negative thoughts about social situations',
      'Celebrate successful social interactions',
      'Gradual exposure to feared situations',
    ],
    professionalHelp: 'Therapy can help develop confidence in social situations',
  },
  behavioral_issues: {
    name: 'Behavioral or Conduct Issues',
    shortName: 'Behavioral Issues',
    icon: '😤',
    description: 'Signs of difficulty with impulse control or following routines',
    symptoms: [
      'Difficulty following rules or routines',
      'Impulsive decisions or actions',
      'Trouble with task completion',
      'Resistance to structure',
    ],
    tips: [
      'Establish clear, consistent rules and routines',
      'Use positive reinforcement for good behavior',
      'Break tasks into smaller steps',
      'Practice problem-solving skills',
      'Use charts or reward systems',
      'Teach impulse control techniques',
      'Regular physical activity to manage energy',
    ],
    professionalHelp: 'Behavioral therapy or coaching can help develop better habits',
  },
  social_isolation: {
    name: 'Social Isolation or Loneliness',
    shortName: 'Social Isolation',
    icon: '😟',
    description: 'Signs of feeling disconnected or lacking social support',
    symptoms: [
      'Feeling alone or isolated',
      'Lack of supportive relationships',
      'Difficulty maintaining friendships',
      'Feeling misunderstood',
    ],
    tips: [
      'Join clubs, sports, or activities of interest',
      'Reach out to one friend to spend time together',
      'Participate in family activities',
      'Try group activities (camps, classes)',
      'Practice active listening and empathy',
      'Use technology to connect with peers',
      'Volunteer to help others (builds connection)',
    ],
    professionalHelp: 'Support groups or therapy can help build healthy relationships',
  },
};

/**
 * Identify mental conditions based on category scores
 * @param {Object} responses - All question responses with IDs
 * @param {Array} questions - Question data from MOCK_QUESTIONNAIRE
 * @returns {Array} - Array of identified conditions with scores
 */
export function identifyConditions(responses, questions) {
  const categoryScores = calculateCategoryScores(responses, questions);
  const conditions = [];

  // Anxiety detection: High worry/nervousness (emotional) + restlessness (behavioral)
  if (
    categoryScores.emotional < 2.5 &&
    categoryScores.behavioral < 2.5
  ) {
    conditions.push({
      condition: MENTAL_CONDITIONS.anxiety,
      confidence: 'high',
      categoryTrigger: ['Anxiety and worry indicators'],
    });
  } else if (
    categoryScores.emotional < 3.0 ||
    categoryScores.behavioral < 3.0
  ) {
    conditions.push({
      condition: MENTAL_CONDITIONS.anxiety,
      confidence: 'moderate',
      categoryTrigger: ['Some anxiety indicators'],
    });
  }

  // Depression detection: Low emotional + low cognitive + low social
  if (
    categoryScores.emotional < 2.0 &&
    categoryScores.cognitive < 2.5
  ) {
    conditions.push({
      condition: MENTAL_CONDITIONS.depression,
      confidence: 'high',
      categoryTrigger: ['Low mood, hopelessness, loss of interest'],
    });
  } else if (categoryScores.emotional < 2.5 && categoryScores.social < 2.5) {
    conditions.push({
      condition: MENTAL_CONDITIONS.depression,
      confidence: 'moderate',
      categoryTrigger: ['Some depressive indicators'],
    });
  }

  // ADHD detection: Low cognitive + behavioral issues + trouble focus/attention
  if (
    categoryScores.cognitive < 2.5 &&
    categoryScores.behavioral < 2.5
  ) {
    conditions.push({
      condition: MENTAL_CONDITIONS.adhd,
      confidence: 'high',
      categoryTrigger: ['Attention, focus, and impulse control difficulties'],
    });
  } else if (categoryScores.cognitive < 3.0) {
    conditions.push({
      condition: MENTAL_CONDITIONS.adhd,
      confidence: 'moderate',
      categoryTrigger: ['Concentration difficulties'],
    });
  }

  // Sleep disorder detection: behavioral suffering + tiredness complaints
  const sleepQs = questions.filter((q) => q.text.toLowerCase().includes('sleep') || q.text.toLowerCase().includes('tired'));
  const sleepScores = sleepQs.map((q) => responses[q.id]).filter((s) => s);
  const avgSleepScore = sleepScores.length > 0 ? sleepScores.reduce((a, b) => a + b) / sleepScores.length : 3;

  if (avgSleepScore < 2.5 && categoryScores.behavioral < 3.0) {
    conditions.push({
      condition: MENTAL_CONDITIONS.sleep_disorder,
      confidence: 'high',
      categoryTrigger: ['Sleep problems affecting daytime functioning'],
    });
  } else if (avgSleepScore < 3.0) {
    conditions.push({
      condition: MENTAL_CONDITIONS.sleep_disorder,
      confidence: 'moderate',
      categoryTrigger: ['Sleep quality concerns'],
    });
  }

  // Low self-esteem: Low emotional scores on self-image questions
  const selfQs = questions.filter((q) => q.text.toLowerCase().includes('proud') || q.text.toLowerCase().includes('good') || q.text.toLowerCase().includes('respect') || q.text.toLowerCase().includes('confident'));
  const selfScores = selfQs.map((q) => responses[q.id]).filter((s) => s);
  const avgSelfScore = selfScores.length > 0 ? selfScores.reduce((a, b) => a + b) / selfScores.length : 3;

  if (avgSelfScore < 2.5) {
    conditions.push({
      condition: MENTAL_CONDITIONS.low_self_esteem,
      confidence: 'high',
      categoryTrigger: ['Negative self-image and lack of confidence'],
    });
  } else if (avgSelfScore < 3.0) {
    conditions.push({
      condition: MENTAL_CONDITIONS.low_self_esteem,
      confidence: 'moderate',
      categoryTrigger: ['Some self-esteem concerns'],
    });
  }

  // Social issues: Low social scores
  if (categoryScores.social < 2.5) {
    conditions.push({
      condition: MENTAL_CONDITIONS.social_anxiety,
      confidence: 'high',
      categoryTrigger: ['Social anxiety and difficulty in social situations'],
    });
  } else if (categoryScores.social < 3.0) {
    conditions.push({
      condition: MENTAL_CONDITIONS.social_isolation,
      confidence: 'moderate',
      categoryTrigger: ['Social support concerns'],
    });
  }

  // Behavioral issues: Task completion and routine problems
  const behaviorQs = questions.filter((q) => q.text.toLowerCase().includes('complete') || q.text.toLowerCase().includes('routine') || q.text.toLowerCase().includes('task'));
  const behaviorScores = behaviorQs.map((q) => responses[q.id]).filter((s) => s);
  const avgBehaviorScore = behaviorScores.length > 0 ? behaviorScores.reduce((a, b) => a + b) / behaviorScores.length : 3;

  if (avgBehaviorScore < 2.5 && categoryScores.behavioral < 2.5) {
    conditions.push({
      condition: MENTAL_CONDITIONS.behavioral_issues,
      confidence: 'moderate',
      categoryTrigger: ['Difficulty with routines and task completion'],
    });
  }

  return conditions.slice(0, 3); // Return top 3 most likely conditions
}

/**
 * Calculate average score for each category
 */
function calculateCategoryScores(responses, questions) {
  const categories = ['emotional', 'behavioral', 'cognitive', 'social'];
  const scores = {};

  categories.forEach((cat) => {
    const catQs = questions.filter((q) => q.id.startsWith(cat.charAt(0)));
    const catScores = catQs.map((q) => responses[q.id]).filter((s) => typeof s === 'number');
    scores[cat] = catScores.length > 0 ? catScores.reduce((a, b) => a + b) / catScores.length : 3;
  });

  return scores;
}

/**
 * Generate comprehensive report for parent
 */
export function generateParentReport(responses, questions, riskLevel, avgScore) {
  const conditions = identifyConditions(responses, questions);

  return {
    riskLevel,
    avgScore,
    summary: `Your child's assessment indicates a ${riskLevel} level of concern with an average score of ${avgScore}/5.`,
    identifiedConditions: conditions,
    overallTips: [
      'Regular check-ins with your child about their feelings',
      'Maintain open, non-judgmental communication',
      'Encourage healthy habits (sleep, exercise, nutrition)',
      'Create a supportive home environment',
      'Celebrate strengths and improvements',
    ],
    nextSteps: riskLevel === 'high'
      ? 'Consider scheduling an appointment with a mental health professional'
      : 'Continue monitoring and implementing wellness activities',
  };
}
