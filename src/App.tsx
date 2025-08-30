import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { TransactionProvider } from './contexts/TransactionContext';
import { AuthForm } from './components/Auth/AuthForm';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { TransactionList } from './components/Transactions/TransactionList';
import { Reports } from './components/Reports/Reports';
import { Chatbot } from './components/Chatbot/Chatbot';
import { Settings as SettingsComponent } from './components/Settings/Settings';
import { setupAutoLogout, cleanupExpiredData, preventDataExposure } from './utils/security';

import { Home, CreditCard, BarChart3, MessageCircle, Settings } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Security setup
  useEffect(() => {
    // Prevent data exposure in development
    preventDataExposure();
    
    // Clean up expired data on app start
    cleanupExpiredData();
    
    // Setup auto-logout for security
    if (isAuthenticated) {
      const cleanupAutoLogout = setupAutoLogout(logout);
      return cleanupAutoLogout;
    }
  }, [isAuthenticated, logout]);

  // Listen for navigation events from header
  useEffect(() => {
    const handleNavigateToSettings = () => {
      setActiveTab('settings');
    };

    window.addEventListener('navigate-to-settings', handleNavigateToSettings);
    return () => {
      window.removeEventListener('navigate-to-settings', handleNavigateToSettings);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'transactions':
        return <TransactionList />;
      case 'reports':
        return <Reports />;
      case 'chatbot':
        return <Chatbot />;
      case 'settings':
        return <SettingsComponent />;
      case 'help':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Help & Support</h2>
            <p className="text-gray-600">Contact us at bazaraisup@gmail.com for assistance</p>
          </div>
        );
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile/Tablet Sidebar - Hidden on mobile, shown as bottom nav */}
      <div className="lg:block hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-3 sm:p-4 lg:p-6">
          {renderContent()}
        </main>
        <footer className="bg-white border-t border-gray-200 px-3 sm:px-4 lg:px-6 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 Bazar.ai. All rights reserved.</p>
          </div>
        </footer>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
        <div className="flex justify-around">
          {[
            { id: 'dashboard', icon: Home },
            { id: 'transactions', icon: CreditCard },
            { id: 'reports', icon: BarChart3 },
            { id: 'chatbot', icon: MessageCircle },
            { id: 'settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1 hidden sm:block">
                  {item.id === 'dashboard' ? 'Home' : 
                   item.id === 'transactions' ? 'Trans' :
                   item.id === 'reports' ? 'Reports' :
                   item.id === 'chatbot' ? 'AI' : 'Settings'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <TransactionProvider>
          <AppContent />
        </TransactionProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;