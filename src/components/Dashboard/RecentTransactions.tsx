import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';
import { useLanguage } from '../../contexts/LanguageContext';
import { Transaction } from '../../types';

interface RecentTransactionsProps {
  filteredTransactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ filteredTransactions }) => {
  const { t } = useLanguage();
  const recentTransactions = filteredTransactions.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.recent_transactions')}</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          {t('dashboard.view_all')}
        </button>
      </div>
      
      <div className="space-y-4">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-600" />
                  )}
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.category}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(transaction.timestamp)}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500">{transaction.payment_method}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions in selected period</p>
            <p className="text-sm">Add transactions or adjust your date filter</p>
          </div>
        )}
      </div>
    </div>
  );
};