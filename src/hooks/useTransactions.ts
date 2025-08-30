import { useState, useEffect } from 'react';
import { Transaction, Category } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useAuth();
  const { language } = useLanguage();

  // Dynamic categories based on language
  const getLocalizedCategories = (): Category[] => {
    const categoryTranslations = {
      en: {
        income: [
          { id: '1', name: 'Sales', type: 'income', tax_rate: 0.12, color: '#10B981' },
          { id: '2', name: 'Services', type: 'income', tax_rate: 0.12, color: '#059669' },
          { id: '7', name: 'Software Development', type: 'income', tax_rate: 0.12, color: '#06B6D4' },
          { id: '8', name: 'Consulting', type: 'income', tax_rate: 0.12, color: '#0EA5E9' },
          { id: '12', name: 'Other', type: 'income', tax_rate: 0.12, color: '#6B7280' },
        ],
        expense: [
          { id: '3', name: 'Office Rent', type: 'expense', tax_rate: 0, color: '#EF4444' },
          { id: '4', name: 'Salaries', type: 'expense', tax_rate: 0, color: '#DC2626' },
          { id: '5', name: 'Utilities', type: 'expense', tax_rate: 0, color: '#B91C1C' },
          { id: '6', name: 'Marketing', type: 'expense', tax_rate: 0, color: '#991B1B' },
          { id: '9', name: 'Transport', type: 'expense', tax_rate: 0, color: '#7F1D1D' },
          { id: '10', name: 'Equipment', type: 'expense', tax_rate: 0, color: '#F97316' },
          { id: '11', name: 'Materials', type: 'expense', tax_rate: 0, color: '#EA580C' },
          { id: '13', name: 'Other', type: 'expense', tax_rate: 0, color: '#6B7280' },
        ]
      },
      ru: {
        income: [
          { id: '1', name: 'Продажи', type: 'income', tax_rate: 0.12, color: '#10B981' },
          { id: '2', name: 'Услуги', type: 'income', tax_rate: 0.12, color: '#059669' },
          { id: '7', name: 'Разработка ПО', type: 'income', tax_rate: 0.12, color: '#06B6D4' },
          { id: '8', name: 'Консалтинг', type: 'income', tax_rate: 0.12, color: '#0EA5E9' },
          { id: '12', name: 'Другое', type: 'income', tax_rate: 0.12, color: '#6B7280' },
        ],
        expense: [
          { id: '3', name: 'Аренда офиса', type: 'expense', tax_rate: 0, color: '#EF4444' },
          { id: '4', name: 'Зарплаты', type: 'expense', tax_rate: 0, color: '#DC2626' },
          { id: '5', name: 'Коммунальные услуги', type: 'expense', tax_rate: 0, color: '#B91C1C' },
          { id: '6', name: 'Маркетинг', type: 'expense', tax_rate: 0, color: '#991B1B' },
          { id: '9', name: 'Транспорт', type: 'expense', tax_rate: 0, color: '#7F1D1D' },
          { id: '10', name: 'Оборудование', type: 'expense', tax_rate: 0, color: '#F97316' },
          { id: '11', name: 'Материалы', type: 'expense', tax_rate: 0, color: '#EA580C' },
          { id: '13', name: 'Другое', type: 'expense', tax_rate: 0, color: '#6B7280' },
        ]
      },
      ky: {
        income: [
          { id: '1', name: 'Сатуу', type: 'income', tax_rate: 0.12, color: '#10B981' },
          { id: '2', name: 'Кызматтар', type: 'income', tax_rate: 0.12, color: '#059669' },
          { id: '7', name: 'ПО иштеп чыгуу', type: 'income', tax_rate: 0.12, color: '#06B6D4' },
          { id: '8', name: 'Консалтинг', type: 'income', tax_rate: 0.12, color: '#0EA5E9' },
          { id: '12', name: 'Башка', type: 'income', tax_rate: 0.12, color: '#6B7280' },
        ],
        expense: [
          { id: '3', name: 'Офис ижарасы', type: 'expense', tax_rate: 0, color: '#EF4444' },
          { id: '4', name: 'Айлык акылар', type: 'expense', tax_rate: 0, color: '#DC2626' },
          { id: '5', name: 'Коммуналдык кызматтар', type: 'expense', tax_rate: 0, color: '#B91C1C' },
          { id: '6', name: 'Маркетинг', type: 'expense', tax_rate: 0, color: '#991B1B' },
          { id: '9', name: 'Транспорт', type: 'expense', tax_rate: 0, color: '#7F1D1D' },
          { id: '10', name: 'Жабдуулар', type: 'expense', tax_rate: 0, color: '#F97316' },
          { id: '11', name: 'Материалдар', type: 'expense', tax_rate: 0, color: '#EA580C' },
          { id: '13', name: 'Башка', type: 'expense', tax_rate: 0, color: '#6B7280' },
        ]
      }
    };

    const langCategories = categoryTranslations[language] || categoryTranslations.en;
    return [...langCategories.income, ...langCategories.expense] as Category[];
  };

  const categories = getLocalizedCategories();

  useEffect(() => {
    if (user) {
      const savedTransactions = localStorage.getItem(`bazar_transactions_${user.id}`);
      if (savedTransactions) {
        try {
          setTransactions(JSON.parse(savedTransactions));
        } catch (error) {
          console.error('Error loading transactions:', error);
        }
      }
    }
  }, [user]);

  const saveTransactions = (newTransactions: Transaction[]) => {
    if (user) {
      localStorage.setItem(`bazar_transactions_${user.id}`, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    }
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
    if (user) {
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        user_id: user.id,
      };
      const updatedTransactions = [newTransaction, ...transactions];
      saveTransactions(updatedTransactions);
    }
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updatedTransactions = transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    saveTransactions(updatedTransactions);
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    saveTransactions(updatedTransactions);
  };

  const getMetrics = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const profit = totalIncome - totalExpenses;
    
    // Only calculate tax liability from actual tax entries, not from transactions
    // This will be 0 until user adds actual tax entries
    const taxLiability = 0;

    return {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      profit,
      tax_liability: taxLiability,
      transaction_count: transactions.length,
      growth_rate: transactions.length > 1 ? 12.5 : 0, // Only show growth if there are transactions
    };
  };

  return {
    transactions,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getMetrics,
  };
};