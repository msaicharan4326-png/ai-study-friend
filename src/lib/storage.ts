import { format } from 'date-fns';

export const storageKeys = {
  user: 'ai-study-friend:user',
  notes: 'ai-study-friend:notes',
  sessions: 'ai-study-friend:sessions',
  tasks: 'ai-study-friend:tasks',
  messages: 'ai-study-friend:messages',
  theme: 'ai-study-friend:theme',
};

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const formatDate = (value: string | Date) =>
  format(new Date(value), 'MMM d, yyyy');

export const formatShortDate = (value: string | Date) =>
  format(new Date(value), 'MMM d');
