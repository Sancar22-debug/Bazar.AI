export const formatDate = (date: string | Date, locale?: string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Get user's language from localStorage or default to 'en'
  const savedLanguage = localStorage.getItem('bazar_language') || 'en';
  
  // Map language codes to proper locales
  const localeMap = {
    'en': 'en-US',
    'ru': 'ru-RU',
    'ky': 'ru-RU' // Use Russian locale for Kyrgyz since ky-KG might not be supported
  };
  
  const targetLocale = locale || localeMap[savedLanguage] || 'en-US';
  
  return new Intl.DateTimeFormat(targetLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: string | Date, locale?: string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Get user's language from localStorage or default to 'en'
  const savedLanguage = localStorage.getItem('bazar_language') || 'en';
  
  // Map language codes to proper locales
  const localeMap = {
    'en': 'en-US',
    'ru': 'ru-RU',
    'ky': 'ru-RU' // Use Russian locale for Kyrgyz since ky-KG might not be supported
  };
  
  const targetLocale = locale || localeMap[savedLanguage] || 'en-US';
  
  return new Intl.DateTimeFormat(targetLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const getDateRange = (period: 'day' | 'week' | 'month' | 'quarter'): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case 'day':
      start.setDate(start.getDate() - 1);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
  }
  
  return { start, end };
};