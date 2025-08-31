# 🏪 Bazar.ai - AI-Powered Financial Management

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Vite-5.4.2-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
</div>

<div align="center">
  <h3>🚀 Live Demo: <a href="https://bazarai-demo.netlify.app">https://bazarai-demo.netlify.app</a></h3>
</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About

Bazar.ai is a modern, AI-powered financial management application designed to help users track expenses, analyze spending patterns, and get intelligent insights about their financial habits. Built with React, TypeScript, and integrated with Google's Gemini AI, it provides a comprehensive solution for personal finance management.

## ✨ Features

### 🔐 **Authentication & Security**
- Secure user authentication system
- Auto-logout for enhanced security
- Data protection and privacy controls
- Session management

### 📊 **Dashboard & Analytics**
- Interactive financial dashboard
- Real-time expense tracking
- Visual charts and graphs using Chart.js
- Customizable time periods (daily, weekly, monthly, yearly)
- Financial metrics and KPIs

### 💳 **Transaction Management**
- Add, edit, and delete transactions
- Categorize expenses and income
- Transaction calendar view
- Search and filter capabilities
- Bulk operations

### 📈 **Reports & Insights**
- Comprehensive financial reports
- Spending pattern analysis
- Export capabilities
- Trend analysis

### 🤖 **AI-Powered Chatbot**
- Integrated Google Gemini AI
- Financial advice and insights
- Natural language queries
- Smart recommendations

### 🌐 **Multi-language Support**
- Internationalization ready
- Multiple language support
- Localized content

### 📱 **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Progressive Web App ready

## 🛠 Tech Stack

### **Frontend**
- **React 18.3.1** - Modern UI library
- **TypeScript 5.5.3** - Type-safe development
- **TailwindCSS 3.4.1** - Utility-first CSS framework
- **Vite 5.4.2** - Fast build tool and dev server

### **UI Components & Icons**
- **Lucide React** - Beautiful, customizable icons
- **React Chart.js 2** - Interactive charts and graphs
- **React DatePicker** - Date selection components

### **AI Integration**
- **Google Generative AI** - Gemini AI integration for chatbot

### **Development Tools**
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sancar22-debug/Bazar.AI.git
   cd Bazar.AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create a .env file in the root directory
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Auth/            # Authentication components
│   ├── Chatbot/         # AI chatbot components
│   ├── Dashboard/       # Dashboard and analytics
│   ├── Layout/          # Layout components (Header, Sidebar)
│   ├── Reports/         # Reports and insights
│   ├── Settings/        # Settings and configuration
│   ├── Transactions/    # Transaction management
│   └── UI/              # Reusable UI components
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   ├── LanguageContext.tsx # Internationalization
│   └── TransactionContext.tsx # Transaction state
├── hooks/               # Custom React hooks
├── services/            # API services
│   └── geminiService.ts # Gemini AI integration
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   ├── currency.ts      # Currency formatting
│   ├── date.ts          # Date utilities
│   └── security.ts      # Security utilities
└── main.tsx            # Application entry point
```

## 🌐 Deployment

### Netlify (Current)
The application is currently deployed on Netlify:
- **Production URL**: https://bazarai-demo.netlify.app
- **Auto-deployment**: Connected to GitHub for automatic updates

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### Other Platforms
This application can be deployed to:
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📞 Support

- **Email**: bazaraisup@gmail.com
- **Issues**: [GitHub Issues](https://github.com/Sancar22-debug/Bazar.AI/issues)
- **Documentation**: Check the wiki for detailed guides

## 🙏 Acknowledgments

- Google Gemini AI for intelligent chatbot capabilities
- Chart.js for beautiful data visualizations
- Lucide for the amazing icon set
- The React and TypeScript communities

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/Sancar22-debug">Sancar22-debug</a></p>
  <p>⭐ Star this repository if you found it helpful!</p>
</div>
