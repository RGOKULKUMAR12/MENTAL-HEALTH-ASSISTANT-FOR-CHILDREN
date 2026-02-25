/**
 * Risk Assessment - Score-based (no ML)
 * Likert 1-5: lower = more concern. Avg score determines risk level.
 */

export const RISK_THRESHOLDS = {
  LOW: { min: 3.5, max: 5 },      // Avg 3.5-5: doing well
  MODERATE: { min: 2.0, max: 3.4 }, // Avg 2.0-3.4: some support helpful
  HIGH: { min: 1, max: 1.9 },     // Avg 1-1.9: professional support recommended
};

export function calculateRisk(responses) {
  const values = Object.values(responses).filter((v) => typeof v === 'number');
  if (values.length === 0) return { riskLevel: 'low', avgScore: 0 };
  const avgScore = values.reduce((a, b) => a + b, 0) / values.length;

  let riskLevel = 'low';
  if (avgScore < 2) riskLevel = 'high';
  else if (avgScore < 3.5) riskLevel = 'moderate';

  return { riskLevel, avgScore: Math.round(avgScore * 10) / 10 };
}

export const RECOMMENDATIONS = {
  low: {
    title: 'Keep up the great work!',
    description: 'Continue regular check-ins and wellness activities.',
    actions: ['Continue daily wellness habits', 'Maintain regular check-ins'],
    showAppointment: false,
    showExercises: true,
  },
  moderate: {
    title: 'Wellness exercises recommended',
    description: 'Consider daily breathing and mindfulness exercises to support well-being.',
    actions: ['Try breathing exercises daily', 'Practice 5-4-3-2-1 grounding', 'Encourage positive habits'],
    showAppointment: false,
    showExercises: true,
  },
  high: {
    title: 'Consider professional support',
    description: 'We recommend scheduling an appointment with a counselor for additional support.',
    actions: ['Book an appointment with a counselor', 'Discuss with your child\'s school counselor', 'Continue wellness activities at home'],
    showAppointment: true,
    showExercises: true,
  },
};
