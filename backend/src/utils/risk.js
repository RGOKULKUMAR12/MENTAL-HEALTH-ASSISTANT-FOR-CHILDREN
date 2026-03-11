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

export function calculateRisk(responses = {}) {
  const values = Object.values(responses).filter((v) => typeof v === 'number');
  if (values.length === 0) {
    return { riskLevel: 'low', avgScore: 0, recommendation: RECOMMENDATIONS.low };
  }

  const avgScore = values.reduce((sum, value) => sum + value, 0) / values.length;
  let riskLevel = 'low';
  if (avgScore < 2) riskLevel = 'high';
  else if (avgScore < 3.5) riskLevel = 'moderate';

  return {
    riskLevel,
    avgScore: Math.round(avgScore * 10) / 10,
    recommendation: RECOMMENDATIONS[riskLevel],
  };
}
