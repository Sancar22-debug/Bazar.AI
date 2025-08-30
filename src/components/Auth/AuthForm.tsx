import React, { useMemo, useState } from 'react';
import { Calculator, Eye, EyeOff, Globe, Check, X, Smartphone, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { evaluatePasswordStrength, sanitizeEmail, sanitizeText, validateEmail, isGmailAddress } from '../../utils/security';

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    business_name: '',
    phone: '',
    language: 'en' as 'en' | 'ru' | 'ky',
  });

  const { login, register } = useAuth();
  const { t, setLanguage } = useLanguage();

  // Password strength checker (shared util, with checks for UI)
  const strengthMeta = useMemo(() => evaluatePasswordStrength(formData.password), [formData.password]);
  const passwordChecks = useMemo(() => ({
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  }), [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sanitize inputs
      const safeEmail = sanitizeEmail(formData.email);
      const safeBusiness = sanitizeText(formData.business_name, { maxLength: 100 });
      const safePhone = sanitizeText(formData.phone, { maxLength: 30 });

      if (!validateEmail(safeEmail)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }
      if (/gmail/i.test(safeEmail) && !isGmailAddress(safeEmail)) {
        setError('Please use a valid Gmail address (example@gmail.com)');
        setLoading(false);
        return;
      }

      if (isLogin) {
        const result = await login(safeEmail, formData.password, twoFactorCode);
        if (result.success) {
          // Login successful
        } else if (result.requiresTwoFactor) {
          setRequiresTwoFactor(true);
          setError('');
        } else {
          setError(result.message || 'Login failed');
        }
      } else {
        const result = await register({
          ...formData,
          email: safeEmail,
          business_name: safeBusiness,
          phone: safePhone,
        });
        if (result.success) {
          setLanguage(formData.language);
        } else {
          setError(result.message || 'Registration failed');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
    { value: 'ky', label: 'Кыргызча' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bazar.ai</h1>
            <p className="text-gray-600 mt-2">Smart Accounting for Your Business</p>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
                setRequiresTwoFactor(false);
                setTwoFactorCode('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
                setRequiresTwoFactor(false);
                setTwoFactorCode('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {isLogin && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-blue-800 font-semibold text-sm">Demo Accounts Available</p>
              </div>
              <div className="text-sm space-y-2">
                <div>
                  <p className="text-blue-700">
                    <strong>Tech Business:</strong> demo@bazar.ai<br />
                    <strong>Password:</strong> demo123<br />
                    <span className="text-xs text-blue-600">IT company with 6 months of data</span>
                  </p>
                </div>
                <div className="border-t border-blue-200 pt-2">
                  <p className="text-blue-700">
                    <strong>Dordoi Bazaar:</strong> dordoi@bazar.ai<br />
                    <strong>Password:</strong> dordoi123<br />
                    <span className="text-xs text-blue-600">Small retail business in Kyrgyz</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {requiresTwoFactor && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {error.includes('email') ? (
                  <Mail className="w-4 h-4 text-blue-600" />
                ) : (
                  <Smartphone className="w-4 h-4 text-blue-600" />
                )}
                <p className="text-blue-800 font-semibold text-sm">
                  {error.includes('email') ? 'Email Verification Required' : 'Two-Factor Authentication'}
                </p>
              </div>
              <p className="text-blue-700 text-sm mb-3">
                {error.includes('email') 
                  ? 'Enter the 6-digit code sent to your email' 
                  : 'Enter the 6-digit code sent to your phone'
                }
              </p>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
                placeholder="000000"
                maxLength={6}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.business_name')}
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!isLogin}
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!isLogin}
                    placeholder="+996 555 123 456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.language')}
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value as 'en' | 'ru' | 'ky' })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      {languageOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Enter your password"
                  minLength={isLogin ? 1 : 8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {!isLogin && formData.password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                  <div className="space-y-1">
                    {Object.entries({
                      'At least 8 characters': passwordChecks.length,
                      'One uppercase letter': passwordChecks.uppercase,
                      'One lowercase letter': passwordChecks.lowercase,
                      'One number': passwordChecks.number,
                      'One special character': passwordChecks.special
                    }).map(([requirement, met]) => (
                      <div key={requirement} className="flex items-center space-x-2">
                        {met ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs ${met ? 'text-green-600' : 'text-red-500'}`}>
                          {requirement}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i <= strengthMeta.score
                              ? strengthMeta.score <= 2
                                ? 'bg-red-500'
                                : strengthMeta.score <= 4
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs mt-1 ${
                      strengthMeta.score <= 2
                        ? 'text-red-600'
                        : strengthMeta.score <= 4
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {strengthMeta.score <= 2
                        ? 'Weak password'
                        : strengthMeta.score <= 4
                        ? 'Medium strength'
                        : 'Strong password'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!isLogin && strengthMeta.score < 3)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>
                {loading 
                  ? t('common.loading') 
                  : requiresTwoFactor 
                    ? 'Verify Code'
                    : isLogin 
                      ? t('auth.sign_in') 
                      : t('auth.create_account')
                }
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setRequiresTwoFactor(false);
                setTwoFactorCode('');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isLogin ? t('auth.no_account') : t('auth.have_account')} {isLogin ? t('auth.sign_up') : t('auth.sign_in')}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Bazar.ai. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};