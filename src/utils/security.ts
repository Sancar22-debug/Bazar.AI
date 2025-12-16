// Security utilities for data protection

export const SECURITY_CONFIG = {
  // Prevent data from being logged to console
  PREVENT_CONSOLE_LOGGING: true,
  
  // Prevent data from being stored in localStorage with sensitive keys
  SENSITIVE_KEYS: ['password', 'token', 'api_key', 'secret'],
  
  // Maximum data retention period (in days)
  MAX_DATA_RETENTION_DAYS: 365,
  
  // Auto-logout after inactivity (in minutes)
  AUTO_LOGOUT_MINUTES: 30,
};

// Sanitize data before logging (remove sensitive information)
export const sanitizeDataForLogging = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  
  // Remove sensitive fields
  SECURITY_CONFIG.SENSITIVE_KEYS.forEach(key => {
    if (sanitized[key]) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  // Remove transaction amounts if logging is disabled
  if (SECURITY_CONFIG.PREVENT_CONSOLE_LOGGING && sanitized.amount) {
    sanitized.amount = '[REDACTED]';
  }
  
  return sanitized;
};

// Secure console logging
export const secureLog = (message: string, data?: any) => {
  if (SECURITY_CONFIG.PREVENT_CONSOLE_LOGGING) {
    console.log(message, data ? sanitizeDataForLogging(data) : '');
  }
};

// Check if data is expired and should be cleaned up
export const isDataExpired = (timestamp: string): boolean => {
  const dataDate = new Date(timestamp);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - SECURITY_CONFIG.MAX_DATA_RETENTION_DAYS);
  
  return dataDate < cutoffDate;
};

// Clean up expired data
export const cleanupExpiredData = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('bazar_')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.timestamp && isDataExpired(parsed.timestamp)) {
              localStorage.removeItem(key);
              console.log(`Cleaned up expired data: ${key}`);
            }
          } catch (e) {
            // If data is not JSON, keep it
          }
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up expired data:', error);
  }
};

// Auto-logout functionality
export const setupAutoLogout = (logoutFunction: () => void) => {
  let inactivityTimer: NodeJS.Timeout;
  
  const resetTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      logoutFunction();
    }, SECURITY_CONFIG.AUTO_LOGOUT_MINUTES * 60 * 1000);
  };
  
  // Reset timer on user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.addEventListener(event, resetTimer, true);
  });
  
  // Initial timer
  resetTimer();
  
  // Return cleanup function
  return () => {
    clearTimeout(inactivityTimer);
    events.forEach(event => {
      document.removeEventListener(event, resetTimer, true);
    });
  };
};

// Prevent data exposure in development
export const preventDataExposure = () => {
  if (process.env.NODE_ENV === 'development') {
    // Override console.log in development to prevent sensitive data logging
    const originalLog = console.log;
    console.log = (...args) => {
      const sanitizedArgs = args.map(arg => 
        typeof arg === 'object' ? sanitizeDataForLogging(arg) : arg
      );
      originalLog(...sanitizedArgs);
    };
  }
};

// Basic input sanitization and validation helpers for auth forms

export const sanitizeEmail = (email: string): string => {
  return (email || '')
    .trim()
    .toLowerCase()
    // remove spaces and control chars
    .replace(/[\u0000-\u001F\u007F\s]+/g, '')
    // collapse multiple @ (malformed) to single
    .replace(/@{2,}/g, '@');
};

export const validateEmail = (email: string): boolean => {
  const sanitized = sanitizeEmail(email);
  // RFC 5322-lite, pragmatic email validator
  const emailRegex = /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
  return emailRegex.test(sanitized);
};

export const isGmailAddress = (email: string): boolean => {
  const sanitized = sanitizeEmail(email);
  return /@(gmail\.com|googlemail\.com)$/i.test(sanitized);
};

export const sanitizeText = (value: string, options?: { maxLength?: number }): string => {
  const maxLength = options?.maxLength ?? 200;
  return (value || '')
    .replace(/[\u0000-\u001F\u007F]/g, '') // remove control chars
    .replace(/[<>]/g, '') // strip HTML tag brackets
    .slice(0, maxLength)
    .trim();
};

export const evaluatePasswordStrength = (password: string): { score: number; label: 'weak' | 'medium' | 'strong' } => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  ];
  const score = checks.filter(Boolean).length;
  let label: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 5) label = 'strong';
  else if (score >= 3) label = 'medium';
  return { score, label };
};