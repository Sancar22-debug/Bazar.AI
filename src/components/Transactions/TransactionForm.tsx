import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTransactions } from '../../hooks/useTransactions';
import { useLanguage } from '../../contexts/LanguageContext';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: any) => void;
  editingTransaction?: any;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'income',
    category: '',
    payment_method: 'cash',
    description: '',
    tax_relevant: false,
    date: new Date(),
  });

  const { categories } = useTransactions();
  const { t, language } = useLanguage();

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        amount: editingTransaction.amount.toString(),
        type: editingTransaction.type,
        category: editingTransaction.category,
        payment_method: editingTransaction.payment_method,
        description: editingTransaction.description,
        tax_relevant: editingTransaction.tax_relevant,
        date: editingTransaction.timestamp ? new Date(editingTransaction.timestamp) : new Date(),
      });
    } else {
      setFormData({
        amount: '',
        type: 'income',
        category: '',
        payment_method: 'cash',
        description: '',
        tax_relevant: false,
        date: new Date(),
      });
    }
  }, [editingTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      timestamp: formData.date.toISOString(),
    });
    onClose();
  };

  const availableCategories = categories.filter(
    cat => cat.type === formData.type
  );

  const paymentMethods = [
    { value: 'cash', label: t('transactions.payment_methods.cash') },
    { value: 'card', label: t('transactions.payment_methods.card') },
    { value: 'transfer', label: t('transactions.payment_methods.transfer') },
    { value: 'mobile', label: t('transactions.payment_methods.mobile') },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTransaction ? t('transactions.edit_transaction') : t('transactions.new_transaction')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('transactions.amount')} (KGS)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('transactions.type')}
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value, category: ''})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="income">{t('transactions.income')}</option>
              <option value="expense">{t('transactions.expense')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('transactions.category')}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{t('transactions.select_category')}</option>
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('transactions.payment_method')}
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('transactions.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
              placeholder={t('transactions.description_placeholder')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('transactions.date') || 'Date'}
            </label>
            <DatePicker
              selected={formData.date}
              onChange={(date: Date | null) => setFormData({ ...formData, date: date ?? new Date() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat={language === 'en' ? 'yyyy-MM-dd HH:mm' : 'dd.MM.yyyy HH:mm'}
              maxDate={new Date()}
              showTimeSelect
              timeIntervals={15}
              showPopperArrow={false}
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="tax_relevant"
              checked={formData.tax_relevant}
              onChange={(e) => setFormData({...formData, tax_relevant: e.target.checked})}
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="tax_relevant" className="text-sm text-gray-700">
              {t('transactions.tax_relevant')}
            </label>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              {editingTransaction ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingTransaction ? t('common.save') : t('common.add')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};