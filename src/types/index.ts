export interface User {
  id: string;
  business_name: string;
  email: string;
  phone: string;
  subscription_plan: 'free' | 'pro' | 'business';
  created_at: string;
  role: 'owner' | 'accountant' | 'staff';
  language: 'en' | 'ru' | 'ky';
  currency: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  payment_method: string;
  description: string;
  timestamp: string;
  tax_relevant: boolean;
}

export interface Report {
  id: string;
  user_id: string;
  period: 'day' | 'week' | 'month' | 'quarter';
  generated_at: string;
  profit: number;
  total_income: number;
  total_expenses: number;
  expenses_by_category: Record<string, number>;
  tax_liability: number;
}

export interface DashboardMetrics {
  total_income: number;
  total_expenses: number;
  profit: number;
  tax_liability: number;
  transaction_count: number;
  growth_rate: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  tax_rate: number;
  color: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}