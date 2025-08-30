import React from 'react';
import { 
  Home, 
  CreditCard, 
  BarChart3, 
  Settings, 
  MessageCircle,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Home },
    { id: 'transactions', label: t('nav.transactions'), icon: CreditCard },
    { id: 'reports', label: t('nav.reports'), icon: BarChart3 },
    { id: 'chatbot', label: t('nav.chatbot'), icon: MessageCircle },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const bottomMenuItems = [
    { id: 'help', label: t('nav.help'), icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 lg:w-64 md:w-20 bg-white shadow-lg h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 md:justify-center lg:justify-start">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="md:hidden lg:block">
            <h1 className="text-xl font-bold text-gray-900">Bazar.ai</h1>
            <p className="text-sm text-gray-500">Smart Accounting</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              } md:justify-center lg:justify-start`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium md:hidden lg:inline">{item.label}</span>
              {/* Tooltip for medium screens */}
              <div className="hidden md:block lg:hidden absolute left-20 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 space-y-2">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-50 md:justify-center lg:justify-start group relative"
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium md:hidden lg:inline">{item.label}</span>
              {/* Tooltip for medium screens */}
              <div className="hidden md:block lg:hidden absolute left-20 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.label}
              </div>
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50 md:justify-center lg:justify-start group relative"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium md:hidden lg:inline">{t('nav.logout')}</span>
          {/* Tooltip for medium screens */}
          <div className="hidden md:block lg:hidden absolute left-20 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {t('nav.logout')}
          </div>
        </button>
      </div>
    </div>
  );
};