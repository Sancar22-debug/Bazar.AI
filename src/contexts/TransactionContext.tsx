import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction } from '../types';

interface TransactionContextType {
  visibleTransactions: Transaction[];
  setVisibleTransactions: (transactions: Transaction[]) => void;
  getVisibleMetrics: () => {
    total_income: number;
    total_expenses: number;
    profit: number;
    transaction_count: number;
  };
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [visibleTransactions, setVisibleTransactions] = useState<Transaction[]>([]);

  const getVisibleMetrics = () => {
    const totalIncome = visibleTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = visibleTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const profit = totalIncome - totalExpenses;

    return {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      profit,
      transaction_count: visibleTransactions.length,
    };
  };

  return (
    <TransactionContext.Provider
      value={{
        visibleTransactions,
        setVisibleTransactions,
        getVisibleMetrics,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}; 