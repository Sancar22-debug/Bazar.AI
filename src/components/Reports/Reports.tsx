import React, { useState } from 'react';
import { FileText, Download, TrendingUp, TrendingDown, Calendar, PieChart } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { formatCurrency } from '../../utils/currency';
import { useLanguage } from '../../contexts/LanguageContext';

export const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('profit-loss');
  const { transactions } = useTransactions();
  const { t } = useLanguage();

  const reportTypes = [
    { id: 'profit-loss', name: t('reports.profit_loss'), icon: TrendingUp },
    { id: 'cash-flow', name: t('reports.cash_flow'), icon: TrendingDown },
    { id: 'category-analysis', name: t('reports.category_analysis'), icon: PieChart },
  ];

  const periods = [
    { id: 'week', name: t('reports.week') },
    { id: 'month', name: t('reports.month') },
    { id: 'quarter', name: t('reports.quarter') },
    { id: 'year', name: t('reports.year') },
  ];

  // Filter transactions based on selected period
  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return transactions.filter(t => new Date(t.timestamp) >= startDate);
  };

  const filteredTransactions = getFilteredTransactions();

  const currentPeriodIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentPeriodExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const profitMargin = currentPeriodIncome > 0 ? ((currentPeriodIncome - currentPeriodExpenses) / currentPeriodIncome) * 100 : 0;

  // Cash flow analysis
  const getCashFlowData = () => {
    const monthlyData = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, net: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
      
      monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expenses;
    });
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));
  };

  // Category analysis
  const getCategoryAnalysis = () => {
    const incomeByCategory = {};
    const expensesByCategory = {};
    
    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + transaction.amount;
      } else {
        expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
      }
    });
    
    const topIncomeCategories = Object.entries(incomeByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
      
    const topExpenseCategories = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    return { topIncomeCategories, topExpenseCategories };
  };

  const handleExport = () => {
    const reportData = {
      period: selectedPeriod,
      report_type: selectedReport,
      generated_at: new Date().toISOString(),
      total_income: currentPeriodIncome,
      total_expenses: currentPeriodExpenses,
      net_profit: currentPeriodIncome - currentPeriodExpenses,
      profit_margin: profitMargin,
      transactions_count: filteredTransactions.length,
      cash_flow: selectedReport === 'cash-flow' ? getCashFlowData() : null,
      category_analysis: selectedReport === 'category-analysis' ? getCategoryAnalysis() : null
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}_report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const cashFlowData = getCashFlowData();
  const categoryAnalysis = getCategoryAnalysis();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.reports')}</h1>
          <p className="text-gray-600">{t('reports.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            {periods.map(period => (
              <option key={period.id} value={period.id}>{period.name}</option>
            ))}
          </select>
          <button 
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t('common.export')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {reportTypes.map(report => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 sm:p-6 rounded-xl border-2 transition-colors text-left ${
                selectedReport === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-8 h-8 mb-3 ${
                selectedReport === report.id ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <h3 className="font-semibold text-gray-900">{report.name}</h3>
            </button>
          );
        })}
      </div>

      {selectedReport === 'profit-loss' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('reports.profit_loss_report')}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{t('reports.current_period')} ({selectedPeriod})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">{t('dashboard.total_income')}</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(currentPeriodIncome)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-800">{t('dashboard.total_expenses')}</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(currentPeriodExpenses)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-medium text-blue-800">{t('dashboard.net_profit')}</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentPeriodIncome - currentPeriodExpenses)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-200 space-y-1 sm:space-y-0">
              <span className="font-medium text-gray-900">{t('reports.profit_margin')}</span>
              <span className="text-lg font-semibold text-blue-600">{profitMargin.toFixed(1)}%</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-200 space-y-1 sm:space-y-0">
              <span className="font-medium text-gray-900">{t('reports.total_transactions')}</span>
              <span className="text-lg font-semibold text-gray-900">{filteredTransactions.length}</span>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'cash-flow' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('reports.cash_flow')} Report</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{t('reports.current_period')} ({selectedPeriod})</span>
            </div>
          </div>

          {cashFlowData.length > 0 ? (
            <div className="space-y-4">
              {cashFlowData.map((monthData, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{monthData.month}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Income</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(monthData.income)}</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800">Expenses</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(monthData.expenses)}</p>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${monthData.net >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                      <p className={`text-sm font-medium ${monthData.net >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Net Cash Flow</p>
                      <p className={`text-lg font-bold ${monthData.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {formatCurrency(monthData.net)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No cash flow data available for the selected period</p>
            </div>
          )}
        </div>
      )}

      {selectedReport === 'category-analysis' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('reports.category_analysis')} Report</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{t('reports.current_period')} ({selectedPeriod})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Income Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Income Categories</h3>
              {categoryAnalysis.topIncomeCategories.length > 0 ? (
                <div className="space-y-3">
                  {categoryAnalysis.topIncomeCategories.map(([category, amount], index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-900">{category}</span>
                      <span className="font-bold text-green-600">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No income categories found</p>
              )}
            </div>

            {/* Top Expense Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Expense Categories</h3>
              {categoryAnalysis.topExpenseCategories.length > 0 ? (
                <div className="space-y-3">
                  {categoryAnalysis.topExpenseCategories.map(([category, amount], index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="font-medium text-gray-900">{category}</span>
                      <span className="font-bold text-red-600">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No expense categories found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('reports.no_data')}</h3>
          <p className="text-gray-500">{t('reports.add_transactions_first')}</p>
        </div>
      )}
    </div>
  );
};