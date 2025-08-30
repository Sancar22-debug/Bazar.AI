import React, { useState, useEffect } from 'react';
import { Plus, Download, Search, Edit2, Trash2, CreditCard, Calendar } from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { TransactionCalendar } from './TransactionCalendar';
import { useTransactions } from '../../hooks/useTransactions';
import { useTransactionContext } from '../../contexts/TransactionContext';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime, formatDate } from '../../utils/date';
import { useLanguage } from '../../contexts/LanguageContext';
import { ConfirmDialog } from '../UI/ConfirmDialog';

export const TransactionList: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; transactionId: string | null }>({
    isOpen: false,
    transactionId: null
  });
  
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { setVisibleTransactions } = useTransactionContext();
  const { t } = useLanguage();

  const handleAddTransaction = (newTransaction: any) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, newTransaction);
      setEditingTransaction(null);
    } else {
      addTransaction(newTransaction);
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, transactionId: id });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.transactionId) {
      deleteTransaction(deleteConfirm.transactionId);
    }
    setDeleteConfirm({ isOpen: false, transactionId: null });
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Description', 'Category', 'Type', 'Amount', 'Payment Method'].join(','),
      ...filteredTransactions.map(t => [
        formatDateTime(t.timestamp),
        `"${t.description}"`,
        t.category,
        t.type,
        t.amount,
        t.payment_method
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || transaction.type === filter;
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const transactionDate = new Date(transaction.timestamp);
      matchesDate = transactionDate >= dateRange.start && transactionDate <= dateRange.end;
    }
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  // Share the filtered transactions with the chatbot
  useEffect(() => {
    setVisibleTransactions(filteredTransactions);
  }, [filteredTransactions, setVisibleTransactions]);

  const handleDateRangeSelect = (start: Date, end: Date) => {
    setDateRange({ start, end });
    setIsCalendarOpen(false);
  };

  const clearDateFilter = () => {
    setDateRange({ start: null, end: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.transactions')}</h1>
          <p className="text-gray-600">{t('transactions.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>{t('transactions.calendar')}</span>
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('transactions.new_transaction')}</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('transactions.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="all">{t('transactions.all')}</option>
              <option value="income">{t('transactions.income')}</option>
              <option value="expense">{t('transactions.expense')}</option>
            </select>

            {dateRange.start && dateRange.end && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg w-full sm:w-auto">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600 truncate">
                  {formatDate(dateRange.start!)} - {formatDate(dateRange.end!)}
                </span>
                <button
                  onClick={clearDateFilter}
                  className="text-blue-600 hover:text-blue-800 ml-2"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleExport}
              disabled={filteredTransactions.length === 0}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              <span>{t('common.export')}</span>
            </button>
          </div>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('transactions.no_transactions')}</h3>
            <p className="text-gray-500 mb-4">{t('transactions.add_first_transaction')}</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 mx-auto transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('transactions.new_transaction')}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 min-w-[100px]">{t('transactions.date')}</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 min-w-[150px]">{t('transactions.description')}</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 hidden sm:table-cell">{t('transactions.category')}</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 hidden md:table-cell">{t('transactions.payment_method')}</th>
                  <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-900 min-w-[100px]">{t('transactions.amount')}</th>
                  <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-900 min-w-[80px]">{t('transactions.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-2 sm:px-4 text-sm text-gray-600">
                      {formatDateTime(transaction.timestamp)}
                    </td>
                    <td className="py-4 px-2 sm:px-4">
                      <div className="font-medium text-gray-900">{transaction.description}</div>
                      {/* Show category on mobile */}
                      <div className="text-sm text-gray-500 sm:hidden">{transaction.category}</div>
                      {transaction.tax_relevant && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                          {t('transactions.tax_relevant')}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-2 sm:px-4 text-sm text-gray-600 hidden sm:table-cell">{transaction.category}</td>
                    <td className="py-4 px-2 sm:px-4 text-sm text-gray-600 capitalize hidden md:table-cell">{transaction.payment_method}</td>
                    <td className={`py-4 px-2 sm:px-4 text-right font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-4 px-2 sm:px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(transaction.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredTransactions.length === 0 && transactions.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('transactions.no_results')}</p>
          </div>
        )}
      </div>
      
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleAddTransaction}
        editingTransaction={editingTransaction}
      />

      <TransactionCalendar
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onDateRangeSelect={handleDateRangeSelect}
        transactions={transactions}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={t('common.confirm')}
        message={t('transactions.confirm_delete')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, transactionId: null })}
      />
    </div>
  );
};