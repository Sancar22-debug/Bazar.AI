import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import { Transaction } from '../../types';

interface TransactionCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onDateRangeSelect: (start: Date, end: Date) => void;
  transactions: Transaction[];
}

export const TransactionCalendar: React.FC<TransactionCalendarProps> = ({
  isOpen,
  onClose,
  onDateRangeSelect,
  transactions
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNamesByLang: Record<'en' | 'ru' | 'ky', string[]> = {
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    ky: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
  };

  // Keep Sunday-first order to match grid calculations
  const weekDaysByLang: Record<'en' | 'ru' | 'ky', string[]> = {
    en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    ru: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
    ky: ['Жк','Дш','Шш','Ср','Бш','Жм','Иш']
  };

  const monthNames = monthNamesByLang[language] || monthNamesByLang.en;
  const weekDays = weekDaysByLang[language] || weekDaysByLang.en;

  const getTransactionsForDate = (date: Date) => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.timestamp);
      return transactionDate.toDateString() === date.toDateString();
    });
  };

  const getDayTotal = (date: Date) => {
    const dayTransactions = getTransactionsForDate(date);
    const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, net: income - expenses };
  };

  const handleDateClick = (date: Date) => {
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: date, end: null });
    } else if (selectedRange.start && !selectedRange.end) {
      if (date >= selectedRange.start) {
        setSelectedRange({ start: selectedRange.start, end: date });
      } else {
        setSelectedRange({ start: date, end: selectedRange.start });
      }
    }
  };

  const isDateInRange = (date: Date) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const isDateSelected = (date: Date) => {
    return selectedRange.start?.toDateString() === date.toDateString() ||
           selectedRange.end?.toDateString() === date.toDateString();
  };

  const handleApplyRange = () => {
    if (selectedRange.start && selectedRange.end) {
      onDateRangeSelect(selectedRange.start, selectedRange.end);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTotal = getDayTotal(date);
      const hasTransactions = getTransactionsForDate(date).length > 0;
      const isSelected = isDateSelected(date);
      const isInRange = isDateInRange(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-24 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
            isSelected ? 'bg-blue-100 border-blue-300' : ''
          } ${isInRange ? 'bg-blue-50' : ''} ${isToday ? 'ring-2 ring-blue-400' : ''}`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
              {day}
            </span>
            {hasTransactions && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
          
          {hasTransactions && (
            <div className="text-xs space-y-1">
              {dayTotal.income > 0 && (
                <div className="text-green-600 font-medium">
                  +{formatCurrency(dayTotal.income)}
                </div>
              )}
              {dayTotal.expenses > 0 && (
                <div className="text-red-600 font-medium">
                  -{formatCurrency(dayTotal.expenses)}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{t('transactions.calendar_view')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {renderCalendarDays()}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>{t('transactions.has_transactions')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span>{t('transactions.selected_date')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-50 border border-gray-200 rounded"></div>
              <span>{t('transactions.date_range')}</span>
            </div>
          </div>
        </div>

        {/* Selected Range Info */}
        {selectedRange.start && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">{t('transactions.selected_range')}</span>
            </div>
            <p className="text-blue-700">
              {formatDate(selectedRange.start)}
              {selectedRange.end && ` - ${formatDate(selectedRange.end)}`}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleApplyRange}
            disabled={!selectedRange.start || !selectedRange.end}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('transactions.apply_filter')}
          </button>
        </div>
      </div>
    </div>
  );
};