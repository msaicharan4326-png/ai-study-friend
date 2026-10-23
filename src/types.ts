export type EducationLevel =
  | 'Class 1-5'
  | 'Class 6-8'
  | 'Class 9-10'
  | 'Class 11-12'
  | 'B.Tech 1st Year'
  | 'B.Tech 2nd Year'
  | 'B.Tech 3rd Year'
  | 'B.Tech 4th Year';

export type SubjectName =
  | 'Mathematics'
  | 'Science'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'English'
  | 'Telugu'
  | 'Computer Science'
  | 'Engineering Mathematics'
  | 'Data Structures'
  | 'AI & ML';

export interface UserPreferences {
  level: EducationLevel;
  board: string;
  primaryLanguage: 'English' | 'Telugu';
  subjects: SubjectName[];
  goals: string[];
  explanationStyle: 'Simple' | 'Step-by-step' | 'Exam' | 'Socratic';
  dailyTargetMinutes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  ageGroup: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  body: string;
  subject: SubjectName;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  subject: SubjectName;
  minutes: number;
  completedAt: string;
}

export interface TodoItem {
  id: string;
  title: string;
  due: string;
  completed: boolean;
}
