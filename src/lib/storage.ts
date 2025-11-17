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

export const addTask = (title: string, category: string): Task => {
  const tasks = getTasks();
  const newTask: Task = {
    id: Date.now().toString(),
    title,
    completed: false,
    category: category as 'trabalho' | 'estudos' | 'saude' | 'pessoal',
    priority: 'medium',
    createdAt: new Date().toISOString(),
  };
  saveTasks([...tasks, newTask]);
  return newTask;
};

export const updateTask = (id: string, updates: Partial<Task>): void => {
  const tasks = getTasks();
  const updatedTasks = tasks.map(task => 
    task.id === id ? { ...task, ...updates } : task
  );
  saveTasks(updatedTasks);
};

export const deleteTask = (id: string): void => {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.id !== id);
  saveTasks(filteredTasks);
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

export const addEvent = (title: string, date: string, category: string): CalendarEvent => {
  const events = getEvents();
  const newEvent: CalendarEvent = {
    id: Date.now().toString(),
    title,
    date,
    category: category as 'trabalho' | 'estudos' | 'saude' | 'pessoal',
    createdAt: new Date().toISOString(),
  };
  saveEvents([...events, newEvent]);
  return newEvent;
};

export const updateEvent = (id: string, updates: Partial<CalendarEvent>): void => {
  const events = getEvents();
  const updatedEvents = events.map(event => 
    event.id === id ? { ...event, ...updates } : event
  );
  saveEvents(updatedEvents);
};

export const deleteEvent = (id: string): void => {
  const events = getEvents();
  const filteredEvents = events.filter(event => event.id !== id);
  saveEvents(filteredEvents);
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

export const addTransaction = (
  description: string, 
  amount: number, 
  type: string, 
  category: string
): Transaction => {
  const transactions = getTransactions();
  const newTransaction: Transaction = {
    id: Date.now().toString(),
    description,
    amount,
    type: type as 'income' | 'expense',
    category: category as 'alimentacao' | 'transporte' | 'saude' | 'lazer' | 'salario' | 'outros',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  saveTransactions([...transactions, newTransaction]);
  return newTransaction;
};

export const updateTransaction = (id: string, updates: Partial<Transaction>): void => {
  const transactions = getTransactions();
  const updatedTransactions = transactions.map(transaction => 
    transaction.id === id ? { ...transaction, ...updates } : transaction
  );
  saveTransactions(updatedTransactions);
};

export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions();
  const filteredTransactions = transactions.filter(transaction => transaction.id !== id);
  saveTransactions(filteredTransactions);
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
