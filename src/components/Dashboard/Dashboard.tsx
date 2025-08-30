import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, MessageCircle, BarChart3, Calendar, Settings } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { ChartCard } from './ChartCard';
import { RecentTransactions } from './RecentTransactions';
import { TransactionCalendar } from '../Transactions/TransactionCalendar';
import { useTransactions } from '../../hooks/useTransactions';
import { useLanguage } from '../../contexts/LanguageContext';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { getMetrics, transactions } = useTransactions();
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // Show all transactions by default
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });



  // Filter transactions based on selected period or date range
  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    if (dateRange.start && dateRange.end) {
      // Custom date range filter
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate >= dateRange.start! && transactionDate <= dateRange.end!;
      });
    } else if (selectedPeriod === 'all') {
      // Show all transactions - no filtering needed
      filtered = [...transactions];
    } else {
      // Time period filter
      const days = parseInt(selectedPeriod);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(t => new Date(t.timestamp) >= cutoffDate);
    }
    

    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  
  // Calculate metrics for filtered data
  const getFilteredMetrics = () => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const profit = totalIncome - totalExpenses;



    return {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      profit,
      transaction_count: filteredTransactions.length,
      growth_rate: filteredTransactions.length > 1 ? 12.5 : 0,
    };
  };

  const metrics = getFilteredMetrics();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'transaction':
        onNavigate('transactions');
        break;
      case 'report':
        onNavigate('reports');
        break;
      case 'chatbot':
        onNavigate('chatbot');
        break;
    }
  };

  const handleDateRangeSelect = (start: Date, end: Date) => {
    setDateRange({ start, end });
    setIsCalendarOpen(false);
  };

  const clearDateFilter = () => {
    setDateRange({ start: null, end: null });
  };

  const periodOptions = [
    { value: '7', label: t('dashboard.last_7_days') },
    { value: '14', label: 'Last 2 weeks' },
    { value: '30', label: t('dashboard.last_30_days') },
    { value: '60', label: 'Last 2 months' },
    { value: '90', label: t('dashboard.last_3_months') },
    { value: 'all', label: 'All time' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Calendar Filter */}
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>{t('transactions.calendar')}</span>
          </button>

          {/* Period Selector */}
          <select 
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              clearDateFilter(); // Clear date range when selecting period
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Status Display */}
      {(dateRange.start && dateRange.end) || selectedPeriod !== 'all' ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-blue-900 font-medium">
              {dateRange.start && dateRange.end ? (
                <>
                  Custom Range: {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                </>
              ) : (
                <>
                  Showing: {periodOptions.find(opt => opt.value === selectedPeriod)?.label || selectedPeriod}
                </>
              )}
              <span className="text-blue-600 ml-2">({filteredTransactions.length} transactions)</span>
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedPeriod('all');
              clearDateFilter();
            }}
            className="text-blue-600 hover:text-blue-800 font-medium self-start sm:self-auto"
          >
            Show All
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-green-600" />
          <span className="text-green-900 font-medium">
            Showing all transactions ({filteredTransactions.length} total)
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <MetricCard
          title={t('dashboard.total_income')}
          value={metrics.total_income}
          icon={TrendingUp}
          color="bg-green-500"
          isCurrency
          trend={metrics.growth_rate}
        />
        <MetricCard
          title={t('dashboard.total_expenses')}
          value={metrics.total_expenses}
          icon={TrendingDown}
          color="bg-red-500"
          isCurrency
        />
        <MetricCard
          title={t('dashboard.net_profit')}
          value={metrics.profit}
          icon={DollarSign}
          color="bg-blue-500"
          isCurrency
          trend={8.2}
        />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <ChartCard filteredTransactions={filteredTransactions} />
        <RecentTransactions filteredTransactions={filteredTransactions} />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.quick_actions')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => handleQuickAction('transaction')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">{t('dashboard.new_transaction')}</span>
          </button>
          <button 
            onClick={() => handleQuickAction('report')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">{t('dashboard.generate_report')}</span>
          </button>
          <button 
            onClick={() => handleQuickAction('chatbot')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">{t('dashboard.ask_ai')}</span>
          </button>
        </div>
      </div>

      <TransactionCalendar
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onDateRangeSelect={handleDateRangeSelect}
        transactions={transactions}
      />
    </div>
  );
};