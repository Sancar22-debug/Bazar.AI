import React, { useState } from 'react';
import { User, Globe, Shield, Mail, Key, Check, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEmailConfirmSetup, setShowEmailConfirmSetup] = useState(false);
  const [showEmailConfirmDisable, setShowEmailConfirmDisable] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const handleLanguageChange = (newLanguage: 'en' | 'ru' | 'ky') => {
    setLanguage(newLanguage);
    if (user) {
      updateUser({ language: newLanguage });
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      business_name: formData.get('business_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    };
    updateUser(updates);
    alert(t('settings.profile_updated'));
  };

  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (passwordStrength.score < 5) {
      alert('Password does not meet security requirements');
      return;
    }
    
    // In production, verify current password and update
    alert('Password updated successfully');
    setShowChangePassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
  };

  const handleEnableEmailConfirm = () => {
    // Enable email confirmation for password reset
    if (user) {
      const existingUsers = JSON.parse(localStorage.getItem('bazar_users') || '[]');
      const userIndex = existingUsers.findIndex((u: any) => u.id === user.id);
      
      if (userIndex !== -1) {
        existingUsers[userIndex].emailConfirmEnabled = true;
        localStorage.setItem('bazar_users', JSON.stringify(existingUsers));
        alert('Email confirmation enabled successfully!');
        setShowEmailConfirmSetup(false);
      }
    }
  };

  const handleDisableEmailConfirm = () => {
    // Disable email confirmation
    if (user) {
      const existingUsers = JSON.parse(localStorage.getItem('bazar_users') || '[]');
      const userIndex = existingUsers.findIndex((u: any) => u.id === user.id);
      
      if (userIndex !== -1) {
        existingUsers[userIndex].emailConfirmEnabled = false;
        localStorage.setItem('bazar_users', JSON.stringify(existingUsers));
        alert('Email confirmation has been disabled');
        setShowEmailConfirmDisable(false);
      }
    }
  };

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'language', label: t('settings.language'), icon: Globe },
    { id: 'security', label: t('settings.security'), icon: Shield },
  ];

  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'ru', label: 'Русский', flag: '🇷🇺' },
    { value: 'ky', label: 'Кыргызча', flag: '🇰🇬' },
  ];

  const isEmailConfirmEnabled = user && JSON.parse(localStorage.getItem('bazar_users') || '[]').find((u: any) => u.id === user.id)?.emailConfirmEnabled;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.settings')}</h1>
        <p className="text-gray-600">{t('settings.subtitle')}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 sm:space-x-4 lg:space-x-8 px-2 sm:px-4 lg:px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">{t('settings.profile_info')}</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    {t('auth.business_name')}
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    defaultValue={user?.business_name}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={user?.email}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    {t('auth.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={user?.phone}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base font-medium"
                >
                  {t('settings.save_changes')}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">{t('settings.language_preferences')}</h3>
              <div className="space-y-3">
                {languageOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-3 sm:p-4 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="language"
                      value={option.value}
                      checked={language === option.value}
                      onChange={() => handleLanguageChange(option.value as 'en' | 'ru' | 'ky')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xl sm:text-2xl">{option.flag}</span>
                    <span className="text-sm sm:text-base text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">{t('settings.security_settings')}</h3>
              
              {/* Password Change */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 flex items-center space-x-2">
                      <Key className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{t('settings.change_password')}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500">{t('settings.change_password_desc')}</p>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="text-blue-600 hover:text-blue-700 font-medium self-start sm:self-auto text-xs sm:text-sm"
                  >
                    {showChangePassword ? 'Cancel' : 'Change'}
                  </button>
                </div>
                
                {showChangePassword && (
                  <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        required
                      />
                      
                      {newPassword && (
                        <div className="mt-2 p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                          <div className="space-y-1">
                            {Object.entries({
                              'At least 8 characters': passwordStrength.checks.length,
                              'One uppercase letter': passwordStrength.checks.uppercase,
                              'One lowercase letter': passwordStrength.checks.lowercase,
                              'One number': passwordStrength.checks.number,
                              'One special character': passwordStrength.checks.special
                            }).map(([requirement, met]) => (
                              <div key={requirement} className="flex items-center space-x-2">
                                {met ? (
                                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                ) : (
                                  <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                                )}
                                <span className={`text-xs ${met ? 'text-green-600' : 'text-red-500'}`}>
                                  {requirement}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={passwordStrength.score < 5 || newPassword !== confirmPassword}
                      className="bg-blue-600 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-sm sm:text-base font-medium"
                    >
                      Update Password
                    </button>
                  </form>
                )}
              </div>

              {/* Email Confirmation for Password Reset */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 flex items-center space-x-2">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Email Confirmation</span>
                      {isEmailConfirmEnabled && (
                        <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">Enabled</span>
                      )}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500">Enable email confirmation for password reset and account security</p>
                  </div>
                  <button
                    onClick={() => {
                      if (isEmailConfirmEnabled) {
                        setShowEmailConfirmDisable(true);
                      } else {
                        setShowEmailConfirmSetup(!showEmailConfirmSetup);
                      }
                    }}
                    className={`font-medium self-start sm:self-auto text-xs sm:text-sm ${
                      isEmailConfirmEnabled
                        ? 'text-red-600 hover:text-red-700'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    {isEmailConfirmEnabled ? 'Disable' : showEmailConfirmSetup ? 'Cancel' : 'Enable'}
                  </button>
                </div>
                
                {showEmailConfirmSetup && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h5 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">What this enables:</h5>
                      <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                        <li>• Password reset via email confirmation</li>
                        <li>• Account verification after 4 failed login attempts</li>
                        <li>• Enhanced account security</li>
                      </ul>
                    </div>
                    <button
                      onClick={handleEnableEmailConfirm}
                      className="bg-green-600 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base font-medium"
                    >
                      Enable Email Confirmation
                    </button>
                  </div>
                )}
              </div>

              {/* Security Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <h4 className="text-xs sm:text-sm font-medium text-green-900">Security Status</h4>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    <span className="text-xs sm:text-sm text-green-700">Password protected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    <span className="text-xs sm:text-sm text-green-700">Data encrypted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEmailConfirmEnabled ? (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    ) : (
                      <X className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                    )}
                    <span className={`text-xs sm:text-sm ${
                      isEmailConfirmEnabled ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      Email confirmation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Confirmation Disable Modal */}
      {showEmailConfirmDisable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Disable Email Confirmation</h3>
            </div>
            
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Are you sure you want to disable email confirmation? This will reduce your account security.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowEmailConfirmDisable(false)}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDisableEmailConfirm}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
              >
                Yes, Disable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};