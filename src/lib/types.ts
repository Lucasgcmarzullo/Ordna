export type ModuleType = 'dashboard' | 'tasks' | 'calendar' | 'finance' | 'ai-assistant' | 'premium' | 'week-planner' | 'focus-mode' | 'backup';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: 'trabalho' | 'estudos' | 'saude' | 'pessoal';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  description?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  color?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  category: 'trabalho' | 'estudos' | 'saude' | 'pessoal';
  time?: string;
  description?: string;
  color?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'alimentacao' | 'transporte' | 'saude' | 'lazer' | 'salario' | 'outros';
  date: string;
  createdAt: string;
}

export interface Subscription {
  isPremium: boolean;
  planType?: 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
}

export interface UserSubscription {
  isPremium: boolean;
  planName: 'free' | 'premium';
  price?: number;
  startDate?: string;
  renewalDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  date?: string;
  time?: string;
  createdAt: string;
}

export interface AIInsight {
  id: string;
  message: string;
  type: 'suggestion' | 'warning' | 'info';
  createdAt: string;
}

export interface PremiumWidget {
  id: string;
  type: 'focus-timer' | 'habit-tracker' | 'mood-tracker' | 'analytics' | 'ai-insights';
  title: string;
  enabled: boolean;
  position: number;
}

// Limites do plano free
export const FREE_PLAN_LIMITS = {
  TASKS: 5,
  EVENTS: 5,
  TRANSACTIONS: 5,
} as const;
