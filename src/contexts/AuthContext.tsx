import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { evaluatePasswordStrength, sanitizeEmail, sanitizeText, validateEmail } from '../utils/security';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, twoFactorCode?: string) => Promise<{ success: boolean; requiresTwoFactor?: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  sendTwoFactorCode: (email: string) => Promise<boolean>;
  enableTwoFactor: (phoneNumber: string) => Promise<boolean>;
  disableTwoFactor: () => Promise<boolean>;
  resetDemoData: () => void;
}

interface RegisterData {
  business_name: string;
  email: string;
  password: string;
  phone: string;
  language: 'en' | 'ru' | 'ky';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Password strength validation (accept Medium or Strong)
const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
  const { label } = evaluatePasswordStrength(password);
  if (label === 'weak') {
    return { isValid: false, message: 'Password must be at least Medium strength (use 3 of: uppercase, lowercase, number, special, min 8 chars)' };
  }
  return { isValid: true, message: label === 'strong' ? 'Strong password' : 'Medium strength password' };
};

// Simple hash for demo - just use the password as is for demo account
const hashPassword = (password: string): string => {
  // For demo account, just return the password as is for easy login
  if (password === 'demo123') {
    return 'demo123';
  }
  
  // For other accounts, use simple hash
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36) + btoa(password).slice(0, 10);
};

// Generate 2FA code
const generateTwoFactorCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate realistic demo transactions for Kyrgyzstan tech business
const generateTechDemoTransactions = () => {
  const transactions = [];
  const categories = {
    income: [
      { 
        name: 'Software Development', 
        descriptions: [
          'Web development project for Bishkek Bank',
          'Mobile banking app for Optima Bank',
          'E-commerce platform for Dordoi Plaza',
          'Government portal development project',
          'CRM system for Kyrgyz Telecom',
          'Database optimization for KICB',
          'API integration for Mbank',
          'Custom ERP solution for Gazprom Kyrgyzstan',
          'Online learning platform development',
          'Fintech app for microfinance organization'
        ] 
      },
      { 
        name: 'Consulting', 
        descriptions: [
          'IT strategy consulting for Kumtor Gold Company',
          'Digital transformation for Kyrgyz Railways',
          'Technology audit for Bishkek City Administration',
          'Business process optimization consulting',
          'Cybersecurity assessment for local bank',
          'Cloud migration strategy for government agency',
          'Software architecture consulting',
          'Project management services for NGO',
          'Technical due diligence for startup',
          'IT infrastructure planning'
        ] 
      },
      { 
        name: 'Services', 
        descriptions: [
          'Monthly maintenance for banking system',
          '24/7 technical support services',
          'Server monitoring and maintenance',
          'Data backup and recovery services',
          'Software license management',
          'System administration services',
          'Network security monitoring',
          'Database administration',
          'Cloud hosting services',
          'Technical training for client staff'
        ] 
      },
      { 
        name: 'Product Sales', 
        descriptions: [
          'Software license sales to enterprise',
          'Hardware equipment sales and setup',
          'Security software implementation',
          'Backup solution deployment',
          'Antivirus software for office network',
          'Project management tool licenses',
          'Development tools and IDE licenses',
          'Cloud storage subscription setup',
          'Communication software licenses',
          'Accounting software customization'
        ] 
      }
    ],
    expense: [
      { 
        name: 'Office Rent', 
        descriptions: [
          'Monthly office rent - Bishkek city center',
          'Coworking space membership at Ala-Too',
          'Meeting room rental for client presentations',
          'Additional office space rental',
          'Parking space rental for company car'
        ] 
      },
      { 
        name: 'Salaries', 
        descriptions: [
          'Senior Full-Stack Developer salary',
          'Junior Frontend Developer payment',
          'Project Manager monthly compensation',
          'UI/UX Designer freelance payment',
          'QA Engineer salary',
          'DevOps Engineer compensation',
          'Business Analyst payment',
          'Technical Writer freelance work',
          'Intern developer stipend',
          'Part-time accountant payment'
        ] 
      },
      { 
        name: 'Equipment', 
        descriptions: [
          'MacBook Pro 16" for senior developer',
          'Dell workstation for design team',
          'iPhone 15 Pro for project manager',
          'Samsung monitors for development team',
          'Ergonomic office chairs and desks',
          'Network equipment and router upgrade',
          'External hard drives for backup',
          'Wireless headphones for team',
          'Webcams and microphones for meetings',
          'Printer and office equipment'
        ] 
      },
      { 
        name: 'Utilities', 
        descriptions: [
          'High-speed internet from Kyrnet',
          'Electricity bill for office space',
          'Mobile phone bills for team',
          'Landline phone service',
          'Water and heating costs',
          'Internet backup connection',
          'Office cleaning services',
          'Security system monthly fee'
        ] 
      },
      { 
        name: 'Marketing', 
        descriptions: [
          'Google Ads campaign for lead generation',
          'Facebook and Instagram advertising',
          'LinkedIn premium for business development',
          'Website SEO optimization services',
          'Business cards and company brochures',
          'Participation in IT conference in Almaty',
          'Sponsorship of local tech meetup',
          'Professional photography for website',
          'Content creation for social media',
          'Email marketing platform subscription'
        ] 
      },
      { 
        name: 'Transport', 
        descriptions: [
          'Client meeting transportation in Bishkek',
          'Business trip to Almaty for conference',
          'Fuel costs for company vehicle',
          'Taxi expenses for team meetings',
          'Airport transfer for international trip',
          'Public transport cards for employees',
          'Car maintenance and service',
          'Parking fees for client visits'
        ] 
      },
      { 
        name: 'Materials', 
        descriptions: [
          'Office supplies and stationery',
          'Technical books and learning resources',
          'Software development books',
          'Printing costs for contracts and docs',
          'Coffee and snacks for office',
          'Cleaning supplies for office',
          'First aid kit and office safety items',
          'Notebooks and writing materials'
        ] 
      }
    ]
  };
  
  const paymentMethods = ['cash', 'card', 'transfer', 'mobile'];
  
  // Generate transactions for the past 3 months for more comprehensive data
  for (let month = 0; month < 3; month++) {
    const date = new Date();
    date.setMonth(date.getMonth() - month);
    
    // Generate 8-15 transactions per month for realistic business activity
    const transactionCount = Math.floor(Math.random() * 8) + 8;
    
    for (let i = 0; i < transactionCount; i++) {
      const transactionDate = new Date(date);
      transactionDate.setDate(Math.floor(Math.random() * 28) + 1);
      transactionDate.setHours(Math.floor(Math.random() * 10) + 8); // Business hours 8-18
      transactionDate.setMinutes(Math.floor(Math.random() * 60));
      
      const isIncome = Math.random() > 0.3; // 70% income, 30% expense (profitable tech business)
      const type = isIncome ? 'income' : 'expense';
      const categoryList = categories[type];
      const selectedCategory = categoryList[Math.floor(Math.random() * categoryList.length)];
      const category = selectedCategory.name;
      const description = selectedCategory.descriptions[Math.floor(Math.random() * selectedCategory.descriptions.length)];
      
      let amount;
      
      if (isIncome) {
        // Income amounts in KGS (realistic for Kyrgyzstan tech business)
        if (category === 'Software Development') {
          amount = Math.floor(Math.random() * 15000) + 5000; // 5k-20k for development projects
        } else if (category === 'Consulting') {
          amount = Math.floor(Math.random() * 8000) + 3000; // 3k-11k for consulting
        } else if (category === 'Services') {
          amount = Math.floor(Math.random() * 6000) + 2000; // 2k-8k for services
        } else {
          amount = Math.floor(Math.random() * 7000) + 2500; // 2.5k-9.5k for product sales
        }
      } else {
        // Expense amounts in KGS
        if (category === 'Salaries') {
          amount = Math.floor(Math.random() * 4000) + 2500; // 2.5k-6.5k for salaries
        } else if (category === 'Office Rent') {
          amount = Math.floor(Math.random() * 1500) + 2000; // 2k-3.5k for rent in Bishkek
        } else if (category === 'Equipment') {
          amount = Math.floor(Math.random() * 8000) + 1500; // 1.5k-9.5k for equipment
        } else if (category === 'Marketing') {
          amount = Math.floor(Math.random() * 2500) + 500; // 500-3k for marketing
        } else if (category === 'Utilities') {
          amount = Math.floor(Math.random() * 800) + 300; // 300-1.1k for utilities
        } else if (category === 'Transport') {
          amount = Math.floor(Math.random() * 1200) + 200; // 200-1.4k for transport
        } else {
          amount = Math.floor(Math.random() * 1000) + 200; // 200-1.2k for materials
        }
      }
      
      transactions.push({
        id: `demo-${Date.now()}-${i}-${month}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: 'demo-user-1',
        amount,
        type,
        category,
        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        description,
        timestamp: transactionDate.toISOString(),
        tax_relevant: Math.random() > 0.4 // 60% tax relevant for business transactions
      });
    }
  }
  
  // Sort by date (newest first)
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Generate realistic demo transactions for Dordoi Bazaar small business
const generateDordoiDemoTransactions = () => {
  const transactions = [];
  const categories = {
    income: [
      { 
        name: 'Кийим сатуу', 
        descriptions: [
          'Аялдар үчүн көйнөк сатуу',
          'Балдар кийими сатуу',
          'Эркектер күртка сатуу',
          'Жейде кийим сатуу',
          'Кыштык кийим сатуу',
          'Спорттук кийим сатуу',
          'Ич кийим сатуу',
          'Жаан кийим сатуу',
          'Майрам кийими сатуу',
          'Жумуш кийими сатуу'
        ] 
      },
      { 
        name: 'Буюм сатуу', 
        descriptions: [
          'Сумка жана рюкзак сатуу',
          'Кол саат сатуу',
          'Көз айнек сатуу',
          'Кол чанта сатуу',
          'Белбоо сатуу',
          'Шляпа жана калпак сатуу',
          'Кол кап сатуу',
          'Шарф сатуу',
          'Зергерлик буюмдар сатуу',
          'Телефон кабыргасы сатуу'
        ] 
      },
      { 
        name: 'Бут кийим сатуу', 
        descriptions: [
          'Аялдар туфли сатуу',
          'Эркектер бут кийим сатуу',
          'Балдар бут кийим сатуу',
          'Спорттук бут кийим сатуу',
          'Кыштык бут кийим сатуу',
          'Жейде бут кийим сатуу',
          'Үй тапочка сатуу',
          'Сандал сатуу',
          'Ботинка сатуу',
          'Кроссовка сатуу'
        ] 
      }
    ],
    expense: [
      { 
        name: 'Товар сатып алуу', 
        descriptions: [
          'Кытайдан кийим алуу',
          'Түркиядан товар алуу',
          'Жергиликтүү өндүрүүчүдөн алуу',
          'Оптовый базардан алуу',
          'Жаңы коллекция алуу',
          'Сезондук товар алуу',
          'Популярдуу товар алуу',
          'Арзан товар алуу',
          'Сапаттуу товар алуу',
          'Тез сатылуучу товар алуу'
        ] 
      },
      { 
        name: 'Орун ижарасы', 
        descriptions: [
          'Дордой базарындагы орун ижарасы',
          'Контейнер ижарасы',
          'Сактагыч ижарасы',
          'Кошумча орун ижарасы',
          'Жайлуу орун ижарасы'
        ] 
      },
      { 
        name: 'Транспорт', 
        descriptions: [
          'Товар ташуу үчүн транспорт',
          'Кытайга баруу чыгымы',
          'Жүк ташуу кызматы',
          'Такси чыгымы',
          'Бензин сатып алуу',
          'Машина оңдоо',
          'Жол акысы',
          'Аэропорт чыгымы'
        ] 
      },
      { 
        name: 'Коммуналдык кызматтар', 
        descriptions: [
          'Электр энергия төлөмү',
          'Суу төлөмү',
          'Интернет төлөмү',
          'Телефон төлөмү',
          'Коопсуздук кызматы',
          'Тазалоо кызматы',
          'Жылытуу төлөмү'
        ] 
      },
      { 
        name: 'Башка чыгымдар', 
        descriptions: [
          'Кесиптик салык төлөмү',
          'Банк кызматы төлөмү',
          'Кассалык аппарат кызматы',
          'Жарнама чыгымы',
          'Кеңсе буюмдары',
          'Тамак-аш чыгымы',
          'Дарыгер чыгымы',
          'Майрам белеги'
        ] 
      }
    ]
  };
  
  const paymentMethods = ['cash', 'card', 'transfer', 'mobile'];
  
  // Generate transactions for the past 4 months for small business
  for (let month = 0; month < 4; month++) {
    const date = new Date();
    date.setMonth(date.getMonth() - month);
    
    // Generate 40-60 transactions per month for active small business
    const transactionCount = Math.floor(Math.random() * 21) + 40;
    
    for (let i = 0; i < transactionCount; i++) {
      const transactionDate = new Date(date);
      transactionDate.setDate(Math.floor(Math.random() * 28) + 1);
      transactionDate.setHours(Math.floor(Math.random() * 12) + 8); // Business hours 8-20
      transactionDate.setMinutes(Math.floor(Math.random() * 60));
      
      const isIncome = Math.random() > 0.4; // 60% income, 40% expense (profitable small business)
      const type = isIncome ? 'income' : 'expense';
      const categoryList = categories[type];
      const selectedCategory = categoryList[Math.floor(Math.random() * categoryList.length)];
      const category = selectedCategory.name;
      const description = selectedCategory.descriptions[Math.floor(Math.random() * selectedCategory.descriptions.length)];
      
      let amount;
      
      if (isIncome) {
        // Income amounts in KGS (realistic for Dordoi small business)
        if (category === 'Кийим сатуу') {
          amount = Math.floor(Math.random() * 3000) + 500; // 500-3500 for clothing
        } else if (category === 'Буюм сатуу') {
          amount = Math.floor(Math.random() * 2000) + 300; // 300-2300 for accessories
        } else {
          amount = Math.floor(Math.random() * 4000) + 800; // 800-4800 for shoes
        }
      } else {
        // Expense amounts in KGS
        if (category === 'Товар сатып алуу') {
          amount = Math.floor(Math.random() * 15000) + 5000; // 5k-20k for inventory
        } else if (category === 'Орун ижарасы') {
          amount = Math.floor(Math.random() * 5000) + 8000; // 8k-13k for rent
        } else if (category === 'Транспорт') {
          amount = Math.floor(Math.random() * 3000) + 1000; // 1k-4k for transport
        } else if (category === 'Коммуналдык кызматтар') {
          amount = Math.floor(Math.random() * 2000) + 500; // 500-2500 for utilities
        } else {
          amount = Math.floor(Math.random() * 2500) + 500; // 500-3000 for other expenses
        }
      }
      
      transactions.push({
        id: `dordoi-${Date.now()}-${i}-${month}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: 'demo-user-2',
        amount,
        type,
        category,
        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        description,
        timestamp: transactionDate.toISOString(),
        tax_relevant: Math.random() > 0.7 // 30% tax relevant for small business
      });
    }
  }
  
  // Sort by date (newest first)
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('bazar_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
        });
      } catch (error) {
        localStorage.removeItem('bazar_user');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }

    // Always ensure demo account exists with correct data
    const existingUsers = JSON.parse(localStorage.getItem('bazar_users') || '[]');
    
    // Tech business demo account
    let techDemoIndex = existingUsers.findIndex((u: any) => u.email === 'demo@bazar.ai');
    
    const techDemoUser = {
      id: 'demo-user-1',
      business_name: 'TechFlow Solutions',
      email: 'demo@bazar.ai',
      phone: '+996 555 123 456',
      subscription_plan: 'free',
      created_at: new Date().toISOString(),
      role: 'owner',
      language: 'en',
      currency: 'KGS',
      password: 'demo123',
      twoFactorEnabled: false
    };
    
    // Dordoi Bazaar demo account
    let dordoiDemoIndex = existingUsers.findIndex((u: any) => u.email === 'dordoi@bazar.ai');
    
    const dordoiDemoUser = {
      id: 'demo-user-2',
      business_name: 'Айгүл Дүкөнү',
      email: 'dordoi@bazar.ai',
      phone: '+996 700 555 123',
      subscription_plan: 'free',
      created_at: new Date().toISOString(),
      role: 'owner',
      language: 'ky',
      currency: 'KGS',
      password: 'dordoi123',
      twoFactorEnabled: false
    };
    
    if (techDemoIndex === -1) {
      existingUsers.push(techDemoUser);
    } else {
      existingUsers[techDemoIndex] = techDemoUser;
    }
    
    if (dordoiDemoIndex === -1) {
      existingUsers.push(dordoiDemoUser);
    } else {
      existingUsers[dordoiDemoIndex] = dordoiDemoUser;
    }
    
    localStorage.setItem('bazar_users', JSON.stringify(existingUsers));
    
    // Force regenerate demo transactions with new realistic amounts
    const techTransactions = generateTechDemoTransactions();
    const dordoiTransactions = generateDordoiDemoTransactions();
    
    localStorage.setItem(`bazar_transactions_${techDemoUser.id}`, JSON.stringify(techTransactions));
    localStorage.setItem(`bazar_transactions_${dordoiDemoUser.id}`, JSON.stringify(dordoiTransactions));
    
    console.log(`Tech demo account initialized with ${techTransactions.length} transactions`);
    console.log(`Dordoi demo account initialized with ${dordoiTransactions.length} transactions`);
    
    // Log the total amounts for verification
    const techIncome = techTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const techExpenses = techTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    console.log(`Tech demo totals - Income: ${techIncome} KGS, Expenses: ${techExpenses} KGS, Profit: ${techIncome - techExpenses} KGS`);
  }, []);

  const sendTwoFactorCode = async (email: string): Promise<boolean> => {
    try {
      const safeEmail = sanitizeEmail(email);
      // Simulate sending SMS/Email
      const code = generateTwoFactorCode();
      localStorage.setItem(`2fa_code_${safeEmail}`, JSON.stringify({
        code,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      }));
      
      // In production, send actual SMS/Email here
      console.log(`2FA Code for ${safeEmail}: ${code}`);
      
      return true;
    } catch (error) {
      console.error('Error sending 2FA code:', error);
      return false;
    }
  };

  const login = async (email: string, password: string, twoFactorCode?: string): Promise<{ success: boolean; requiresTwoFactor?: boolean; message?: string }> => {
    try {
      const safeEmail = sanitizeEmail(email);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check login attempts
      const loginAttempts = JSON.parse(localStorage.getItem(`login_attempts_${safeEmail}`) || '{"count": 0, "lastAttempt": 0}');
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      // Reset attempts if more than 1 hour has passed
      if (now - loginAttempts.lastAttempt > oneHour) {
        loginAttempts.count = 0;
      }
      
      const existingUsers = JSON.parse(localStorage.getItem('bazar_users') || '[]');
      
      // Find user
      const user = existingUsers.find((u: any) => u.email === safeEmail);
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      // Verify password - special handling for demo account
      let passwordMatch = false;
      if ((safeEmail === 'demo@bazar.ai' && password === 'demo123') || 
          (safeEmail === 'dordoi@bazar.ai' && password === 'dordoi123')) {
        passwordMatch = true;
      } else {
        const hashedInputPassword = hashPassword(password);
        passwordMatch = user.password === hashedInputPassword;
      }
      
      if (!passwordMatch) {
        // Increment failed login attempts
        loginAttempts.count += 1;
        loginAttempts.lastAttempt = now;
        localStorage.setItem(`login_attempts_${safeEmail}`, JSON.stringify(loginAttempts));
        
        // Check if user needs email verification after 4 failed attempts
        if (loginAttempts.count >= 4 && user.emailConfirmEnabled) {
          // Send email verification code
          const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
          localStorage.setItem(`email_verification_${safeEmail}`, JSON.stringify({
            code: verificationCode,
            expires: now + 15 * 60 * 1000 // 15 minutes
          }));
          
          return { 
            success: false, 
            requiresTwoFactor: true, 
            message: `Too many failed attempts. Please check your email for verification code: ${verificationCode}` 
          };
        }
        
        return { success: false, message: 'Invalid password' };
      }
      
      // Reset login attempts on successful password verification
      localStorage.removeItem(`login_attempts_${safeEmail}`);
      
      // Check if 2FA is enabled
      if (user.twoFactorEnabled && !twoFactorCode) {
        await sendTwoFactorCode(safeEmail);
        return { success: false, requiresTwoFactor: true, message: '2FA code sent to your phone' };
      }
      
      // Check if email verification is required (after 4 failed attempts)
      if (loginAttempts.count >= 4 && user.emailConfirmEnabled && twoFactorCode) {
        const storedVerification = localStorage.getItem(`email_verification_${safeEmail}`);
        if (storedVerification) {
          const { code, expires } = JSON.parse(storedVerification);
          if (now > expires) {
            return { success: false, message: 'Verification code expired. Please try logging in again.' };
          }
          if (code !== twoFactorCode) {
            return { success: false, message: 'Invalid verification code' };
          }
          // Clean up used code
          localStorage.removeItem(`email_verification_${safeEmail}`);
        }
      }
      
      // Verify 2FA code if provided
      if (user.twoFactorEnabled && twoFactorCode) {
        const stored2FA = localStorage.getItem(`2fa_code_${safeEmail}`);
        if (stored2FA) {
          const { code, expires } = JSON.parse(stored2FA);
          if (Date.now() > expires) {
            return { success: false, message: '2FA code expired. Please request a new one.' };
          }
          if (code !== twoFactorCode) {
            return { success: false, message: 'Invalid 2FA code' };
          }
          // Clean up used code
          localStorage.removeItem(`2fa_code_${safeEmail}`);
        } else {
          return { success: false, message: 'No 2FA code found. Please request a new one.' };
        }
      }
      
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('bazar_user', JSON.stringify(userWithoutPassword));
      setAuthState({
        isAuthenticated: true,
        user: userWithoutPassword,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      const safeEmail = sanitizeEmail(userData.email);
      if (!validateEmail(safeEmail)) {
        return { success: false, message: 'Please enter a valid email address' };
      }
      const safeBusiness = sanitizeText(userData.business_name, { maxLength: 100 });
      const safePhone = sanitizeText(userData.phone, { maxLength: 30 });

      // Validate password strength
      const passwordValidation = validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.message };
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('bazar_users') || '[]');
      const userExists = existingUsers.find((u: any) => u.email === safeEmail);
      
      if (userExists) {
        return { success: false, message: 'User with this email already exists' };
      }
      
      const user: User = {
        id: Date.now().toString(),
        business_name: safeBusiness,
        email: safeEmail,
        phone: safePhone,
        subscription_plan: 'free',
        created_at: new Date().toISOString(),
        role: 'owner',
        language: userData.language,
        currency: 'KGS',
      };

      // Save to users list with hashed password
      existingUsers.push({ 
        ...user, 
        password: hashPassword(userData.password),
        twoFactorEnabled: false
      });
      localStorage.setItem('bazar_users', JSON.stringify(existingUsers));

      // Set current user (without password)
      localStorage.setItem('bazar_user', JSON.stringify(user));
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  const enableTwoFactor = async (phoneNumber: string): Promise<boolean> => {
    try {
      if (authState.user) {
        const existingUsers = JSON.parse(localStorage.getItem('bazar_users') || '[]');
        const userIndex = existingUsers.findIndex((u: any) => u.id === authState.user!.id);
        
        if (userIndex !== -1) {
          existingUsers[userIndex].twoFactorEnabled = true;
          existingUsers[userIndex].phone = phoneNumber;
          localStorage.setItem('bazar_users', JSON.stringify(existingUsers));
          
          const updatedUser = { ...authState.user, phone: phoneNumber };
          localStorage.setItem('bazar_user', JSON.stringify(updatedUser));
          setAuthState(prev => ({ ...prev, user: updatedUser }));
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return false;
    }
  };

  const disableTwoFactor = async (): Promise<boolean> => {
    try {
      if (authState.user) {
        const existingUsers = JSON.parse(localStorage.getItem('bazar_users') || '[]');
        const userIndex = existingUsers.findIndex((u: any) => u.id === authState.user!.id);
        
        if (userIndex !== -1) {
          existingUsers[userIndex].twoFactorEnabled = false;
          localStorage.setItem('bazar_users', JSON.stringify(existingUsers));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('bazar_user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem('bazar_user', JSON.stringify(updatedUser));
      
      // Update in users list too
      const existingUsers = JSON.parse(localStorage.getItem('bazar_users') || '[]');
      const userIndex = existingUsers.findIndex((u: any) => u.id === updatedUser.id);
      if (userIndex !== -1) {
        existingUsers[userIndex] = { ...existingUsers[userIndex], ...userData };
        localStorage.setItem('bazar_users', JSON.stringify(existingUsers));
      }
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  };

  const resetDemoData = () => {
    // Clear existing demo transactions
    localStorage.removeItem(`bazar_transactions_demo-user-1`);
    localStorage.removeItem(`bazar_transactions_demo-user-2`);
    
    // Regenerate demo transactions with new realistic amounts
    const techTransactions = generateTechDemoTransactions();
    const dordoiTransactions = generateDordoiDemoTransactions();
    
    localStorage.setItem(`bazar_transactions_demo-user-1`, JSON.stringify(techTransactions));
    localStorage.setItem(`bazar_transactions_demo-user-2`, JSON.stringify(dordoiTransactions));
    
    console.log('Demo data reset successfully with realistic amounts');
    console.log(`Tech demo: ${techTransactions.length} transactions, Total Income: ${techTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)} KGS`);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateUser,
        sendTwoFactorCode,
        enableTwoFactor,
        disableTwoFactor,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};