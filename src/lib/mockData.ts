export const sampleBoardOptions = [
  'CBSE',
  'ICSE',
  'State Board (Telangana)',
  'State Board (Andhra Pradesh)',
  'IB',
  'International Curriculum',
  'JNTU / State University',
  'NIT / Engineering Track',
];

export const sampleSubjects = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Telugu',
  'Computer Science',
  'Engineering Mathematics',
  'Data Structures',
  'AI & ML',
] as const;

export const sampleGoals = [
  'Improve concept clarity',
  'Prepare for unit tests',
  'Build a stronger revision habit',
  'Solve homework independently',
  'Practice programming questions',
  'Finish exam revision before deadline',
];

export const recommendedTopics = [
  'Quadratic equations',
  'Photosynthesis revision',
  'Motion and force',
  'Modern Indian history',
  'Data structures arrays',
  'Probability basics',
];

export const subjectColorMap: Record<string, string> = {
  Mathematics: '#7c3aed',
  Science: '#0ea5e9',
  Physics: '#f97316',
  Chemistry: '#22c55e',
  Biology: '#10b981',
  English: '#ec4899',
  Telugu: '#f59e0b',
  'Computer Science': '#3b82f6',
  'Engineering Mathematics': '#8b5cf6',
  'Data Structures': '#14b8a6',
  'AI & ML': '#ef4444',
};

export const initialMessages = [
  {
    id: 'msg-1',
    role: 'assistant',
    content:
      'Hi! I’m your AI Study Friend. Ask me anything from homework to revision, and I’ll explain it in a friendly, step-by-step way.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content:
      'You can also ask for a quiz, a Telugu explanation, or a quick practice problem. Let’s learn together!',
    createdAt: new Date().toISOString(),
  },
];
