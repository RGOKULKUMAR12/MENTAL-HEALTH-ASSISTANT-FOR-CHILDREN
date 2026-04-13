/**
 * Mock data for UI rendering - ready to be replaced with API calls
 * All data is anonymized and for demonstration purposes only
 */

export const MOCK_USERS = {
  child: {
    id: 'child-1',
    name: 'Alex',
    role: 'child',
    email: 'alex@example.com',
    parentId: 'parent-1',
    consentStatus: 'approved',
  },
  parent: {
    id: 'parent-1',
    name: 'Sarah Smith',
    role: 'parent',
    email: 'sarah@example.com',
    linkedChildren: ['child-1', 'child-2'],
  },
  admin: {
    id: 'admin-1',
    name: 'Dr. Gokul Kumar',
    role: 'admin',
    email: 'admin@example.com',
  },
};

export const MOCK_LINKED_CHILDREN = [
  { id: 'child-1', name: 'Alex', age: 10, lastAssessment: '2025-02-20', riskLevel: 'low' },
  { id: 'child-2', name: 'Jordan', age: 12, lastAssessment: '2025-02-18', riskLevel: 'moderate' },
  { id: 'child-3', name: 'Sam', age: 9, lastAssessment: '2025-02-22', riskLevel: 'high' },
];

export const MOCK_CONSENT_REQUESTS = [
  { id: 'req-1', childName: 'Alex', requestedAt: '2025-02-15', status: 'approved' },
  { id: 'req-2', childName: 'Jordan', requestedAt: '2025-02-18', status: 'pending' },
];

export const MOCK_MOOD_TREND = [
  { date: '2025-02-01', mood: 4, stress: 2 },
  { date: '2025-02-08', mood: 3, stress: 3 },
  { date: '2025-02-15', mood: 4, stress: 2 },
  { date: '2025-02-20', mood: 5, stress: 1 },
];

export const MOCK_RISK_TIMELINE = [
  { date: '2025-01-15', level: 'low', score: 15 },
  { date: '2025-01-22', level: 'low', score: 18 },
  { date: '2025-02-01', level: 'moderate', score: 35 },
  { date: '2025-02-15', level: 'moderate', score: 42 },
  { date: '2025-02-20', level: 'low', score: 22 },
];

export const MOCK_ALERTS = [
  { id: 1, type: 'info', message: 'Stress trend increased slightly last week', severity: 'low', date: '2025-02-20', childId: 'child-1' },
  { id: 2, type: 'attention', message: 'Mood pattern change detected - consider checking in', severity: 'moderate', date: '2025-02-18', childId: 'child-2' },
];

export const MOCK_QUESTIONNAIRE = {
  categories: [
    {
      id: 'emotional',
      name: 'Emotional',
      icon: '😊',
      questions: [
        { id: 'e1', text: 'How happy did you feel most days this week?', scale: 5 },
        { id: 'e2', text: 'How often did you feel calm or relaxed?', scale: 5 },
        { id: 'e3', text: 'How often did you feel sad or down?', scale: 5 },
        { id: 'e4', text: 'How often did you feel worried or nervous about things?', scale: 5 },
        { id: 'e5', text: 'How often did you enjoy the things you usually like to do?', scale: 5 },
        { id: 'e6', text: 'How often did you feel hopeful about your future?', scale: 5 },
        { id: 'e7', text: 'How often did you feel proud of yourself?', scale: 5 },
        { id: 'e8', text: 'How often did you feel like a good person living a good life?', scale: 5 },
        { id: 'e9', text: 'How often did you feel bad about yourself or like you let yourself down?', scale: 5 },
        { id: 'e10', text: 'How often did you feel people respected you?', scale: 5 },
      ],
    },
    {
      id: 'behavioral',
      name: 'Behavioral',
      icon: '🌟',
      questions: [
        { id: 'b1', text: 'How well did you sleep most nights this week?', scale: 5 },
        { id: 'b2', text: 'How much energy did you have for school or play?', scale: 5 },
        { id: 'b3', text: 'How often did you eat regular meals (breakfast, lunch, dinner)?', scale: 5 },
        { id: 'b4', text: 'How often did you feel too tired to do things you needed to do?', scale: 5 },
        { id: 'b5', text: 'How often did you feel restless or find it hard to sit still?', scale: 5 },
        { id: 'b6', text: 'How often did you follow your usual daily routine?', scale: 5 },
        { id: 'b7', text: 'How often did you finish tasks you started (homework, chores)?', scale: 5 },
        { id: 'b8', text: 'How often did you remember to take short breaks when you needed them?', scale: 5 },
        { id: 'b9', text: 'How often did you feel you had enough time to get things done?', scale: 5 },
        { id: 'b10', text: 'How often did you take care of your body (sleep, food, movement)?', scale: 5 },
      ],
    },
    {
      id: 'cognitive',
      name: 'Cognitive',
      icon: '💭',
      questions: [
        { id: 'c1', text: 'How clear did your thoughts feel when you were working or playing?', scale: 5 },
        { id: 'c2', text: 'How often could you concentrate on school work?', scale: 5 },
        { id: 'c3', text: 'How often could you pay attention when someone was talking to you?', scale: 5 },
        { id: 'c4', text: 'How often did you remember what teachers or adults told you?', scale: 5 },
        { id: 'c5', text: 'How confident did you feel about finishing your school work?', scale: 5 },
        { id: 'c6', text: 'How often did you feel interested in your daily activities?', scale: 5 },
        { id: 'c7', text: 'How often did you feel able to solve problems that came up?', scale: 5 },
        { id: 'c8', text: 'How often did you feel organized with your school things?', scale: 5 },
        { id: 'c9', text: 'How often did you feel you could make good decisions?', scale: 5 },
        { id: 'c10', text: 'How often did you feel sure you could handle challenges?', scale: 5 },
      ],
    },
    {
      id: 'social',
      name: 'Social',
      icon: '👋',
      questions: [
        { id: 's1', text: 'How supported did you feel by your family?', scale: 5 },
        { id: 's2', text: 'How supported did you feel by your friends?', scale: 5 },
        { id: 's3', text: 'How often did you feel like you belong in your class or school?', scale: 5 },
        { id: 's4', text: 'How often did you have someone to talk to when you needed?', scale: 5 },
        { id: 's5', text: 'How often did you feel other people listened to you?', scale: 5 },
        { id: 's6', text: 'How often did you feel you were part of a group or team?', scale: 5 },
        { id: 's7', text: 'How often did you feel safe with the people around you?', scale: 5 },
        { id: 's8', text: 'How often did you help others or make them feel better?', scale: 5 },
        { id: 's9', text: 'How often did you feel treated fairly by other kids?', scale: 5 },
        { id: 's10', text: 'How often did you feel people were kind to you?', scale: 5 },
      ],
    },
  ],
};

export const MOCK_AGGREGATE_ANALYTICS = [
  { category: 'Low Risk', count: 120, color: '#22c55e' },
  { category: 'Moderate', count: 35, color: '#f59e0b' },
  { category: 'High Risk', count: 8, color: '#ef4444' },
];

export const MOCK_ACTIVITIES = [
  { id: 1, type: 'breathing', title: 'Balloon Breath', duration: 60, description: 'Breathe in and out slowly like filling a balloon' },
  { id: 2, type: 'mindfulness', title: '5-4-3-2-1 Grounding', duration: 120, description: 'Notice 5 things you see, 4 you hear, 3 you touch...' },
  { id: 3, type: 'habit', title: 'Daily Gratitude', duration: 30, description: "Think of one thing you're thankful for today" },
];
