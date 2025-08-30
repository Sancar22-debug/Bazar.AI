import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { useLanguage } from '../../contexts/LanguageContext';
// import { useAuth } from '../../contexts/AuthContext';
import { useTransactionContext } from '../../contexts/TransactionContext';
import { geminiService } from '../../services/geminiService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isAI?: boolean;
}

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { transactions, getMetrics } = useTransactions();
  const { t, language } = useLanguage();
  // const { resetDemoData } = useAuth();
  const { visibleTransactions, getVisibleMetrics } = useTransactionContext();



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only show welcome message once when component mounts
    if (!hasGreeted && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'bot',
        content: getWelcomeMessage(),
        timestamp: new Date(),
        isAI: true
      };
      setMessages([welcomeMessage]);
      setHasGreeted(true);
    }
  }, [hasGreeted, language, messages.length]);

  // No persistence: conversation is in-memory only for the current session

  const getWelcomeMessage = () => {
    const welcomeMessages = {
      en: "Hello! I'm your AI financial assistant. I can analyze your business data and provide insights. What would you like to know?",
      ru: "Привет! Я ваш ИИ финансовый помощник. Могу анализировать данные бизнеса и давать советы. Что вас интересует?",
      ky: "Салам! Мен сиздин ИИ финансылык жардамчыңызмын. Бизнес маалыматтарын анализдеп, кеңештерди бере алам. Эмне билгиңиз келет?"
    };
    return welcomeMessages[language] || welcomeMessages.en;
  };

  const prepareDataForAI = () => {
    // Use visible transactions (what's currently shown on screen) instead of all transactions
    const currentTransactions = visibleTransactions.length > 0 ? visibleTransactions : transactions;
    const metrics = visibleTransactions.length > 0 ? getVisibleMetrics() : getMetrics();
    
    // Get top expense categories from visible transactions
    const expensesByCategory = currentTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topExpenseCategories = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    // Get recent transactions from visible transactions
    const recentTransactions = currentTransactions
      .slice(0, 10)
      .map(t => ({
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: new Date(t.timestamp).toLocaleDateString(),
        payment_method: t.payment_method
      }));

    // Add more detailed financial insights from visible transactions
    const incomeByCategory = currentTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topIncomeCategories = Object.entries(incomeByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, amount]) => ({ category, amount }));

    return {
      totalIncome: metrics.total_income,
      totalExpenses: metrics.total_expenses,
      profit: metrics.profit,
      transactionCount: metrics.transaction_count,
      topExpenseCategories,
      topIncomeCategories,
      recentTransactions,
      // Add month-over-month data for better insights
      monthlyData: getMonthlyData(currentTransactions),
      // Add category breakdown for better analysis
      categoryBreakdown: {
        income: incomeByCategory,
        expenses: expensesByCategory
      },
      // Add context about what data is being analyzed
      dataContext: visibleTransactions.length > 0 ? 
        `Analyzing ${visibleTransactions.length} visible transactions (filtered view)` : 
        `Analyzing all ${transactions.length} transactions`
    };
  };

  // Add this new function to get monthly data
  const getMonthlyData = (transactionList = transactions) => {
    const monthlyData: Record<string, { income: number; expenses: number; profit: number }> = {};
    
    transactionList.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, profit: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });
    
    // Calculate profit for each month
    Object.keys(monthlyData).forEach(month => {
      monthlyData[month].profit = monthlyData[month].income - monthlyData[month].expenses;
    });
    
    return monthlyData;
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Prepare financial data for AI
      const financialData = prepareDataForAI();

      // Build short recent conversation history for continuity
      const historyForAI = [...messages, userMessage]
        .slice(-8)
        .map(m => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
      
      // Get AI response from Gemini
      const aiResponse = await geminiService.analyzeFinancialData(
        currentQuery, 
        financialData, 
        language,
        historyForAI
      );

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponse,
        timestamp: new Date(),
        isAI: true
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('AI Response Error:', error);
      
      // Show error message instead of fallback script
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: t('chatbot.ai_error_message') || 'I apologize, but I\'m having trouble analyzing your data right now. Please try again in a moment.',
        timestamp: new Date(),
        isAI: false
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    t('chatbot.quick_income'),
    t('chatbot.quick_expenses'),
    t('chatbot.quick_profit'),
    t('chatbot.quick_advice')
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <span>{t('nav.chatbot')}</span>
            <Sparkles className="w-6 h-6 text-purple-600" />
          </h1>
          <p className="text-gray-600">{t('chatbot.subtitle')}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium border border-purple-200 self-start sm:self-auto">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Powered by Gemini 2.0 Flash</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[500px] sm:h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <span>{t('chatbot.ai_assistant')}</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">{t('chatbot.online')} • AI-Powered Financial Assistant</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 sm:space-x-3 max-w-xs sm:max-w-sm lg:max-w-md ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-100' 
                    : message.isAI 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                      : 'bg-purple-100'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  ) : (
                    <Bot className={`w-3 h-3 sm:w-4 sm:h-4 ${message.isAI ? 'text-white' : 'text-purple-600'}`} />
                  )}
                </div>
                <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl relative ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : message.isAI
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-gray-900 border border-purple-200'
                      : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  {message.isAI && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-purple-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl">
                  <div className="flex space-x-1 items-center">
                    <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-purple-500 animate-pulse" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs sm:text-sm text-gray-600 mb-3 font-medium">{t('chatbot.quick_questions')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(question)}
                  className="text-left p-2 sm:p-3 text-xs sm:text-sm bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border border-gray-200 hover:border-purple-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-2 sm:space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatbot.type_message')}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl"
            >
              <Send className="w-4 h-4" />
              <Sparkles className="w-3 h-3 hidden sm:block" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};