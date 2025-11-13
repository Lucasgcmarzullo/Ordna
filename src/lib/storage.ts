// LocalStorage helpers for Odrna

import { Task, CalendarEvent, Transaction, Goal, Reminder, AIInsight, PremiumWidget, UserSubscription } from './types';

const STORAGE_KEYS = {
  TASKS: 'odrna_tasks',
  EVENTS: 'odrna_events',
  TRANSACTIONS: 'odrna_transactions',
  GOALS: 'odrna_goals',
  REMINDERS: 'odrna_reminders',
  AI_INSIGHTS: 'odrna_ai_insights',
  PREMIUM_WIDGETS: 'odrna_premium_widgets',
  SUBSCRIPTION: 'odrna_subscription',
} as const;

// Tasks
export const getTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
};

export const saveTasks = (tasks: Task[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

// Calendar Events
export const getEvents = (): CalendarEvent[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
  return data ? JSON.parse(data) : [];
};

export const saveEvents = (events: CalendarEvent[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

// Transactions
export const getTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

export const saveTransactions = (transactions: Transaction[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

// Goals
export const getGoals = (): Goal[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.GOALS);
  return data ? JSON.parse(data) : [];
};

export const saveGoals = (goals: Goal[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
};

// Reminders
export const getReminders = (): Reminder[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
  return data ? JSON.parse(data) : [];
};

export const saveReminders = (reminders: Reminder[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
};

// AI Insights
export const getAIInsights = (): AIInsight[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.AI_INSIGHTS);
  return data ? JSON.parse(data) : [];
};

export const saveAIInsights = (insights: AIInsight[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.AI_INSIGHTS, JSON.stringify(insights));
};

// Premium Widgets
export const getPremiumWidgets = (): PremiumWidget[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PREMIUM_WIDGETS);
  return data ? JSON.parse(data) : getDefaultWidgets();
};

export const savePremiumWidgets = (widgets: PremiumWidget[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PREMIUM_WIDGETS, JSON.stringify(widgets));
};

const getDefaultWidgets = (): PremiumWidget[] => [
  { id: '1', type: 'focus-timer', title: 'Timer Pomodoro', enabled: true, position: 1 },
  { id: '2', type: 'habit-tracker', title: 'Rastreador de Hábitos', enabled: true, position: 2 },
  { id: '3', type: 'mood-tracker', title: 'Humor Diário', enabled: true, position: 3 },
  { id: '4', type: 'analytics', title: 'Análises Avançadas', enabled: true, position: 4 },
  { id: '5', type: 'ai-insights', title: 'Insights de IA', enabled: true, position: 5 },
];

// Subscription
export const getSubscription = (): UserSubscription => {
  if (typeof window === 'undefined') return { isPremium: false, planName: 'free' };
  const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
  return data ? JSON.parse(data) : { isPremium: false, planName: 'free' };
};

export const saveSubscription = (subscription: UserSubscription): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
};
