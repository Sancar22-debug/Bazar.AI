# NOT VERY SECURE YET HIGHLY NOT SUGGEST WRITING YOUR REAL DATA, ANY DATA CAN WORK OUT FOR NOW

# Bazar.ai

A financial management application for small businesses in Kyrgyzstan. Track your income, expenses, and get AI-powered insights about your business.

**Live Demo:** https://bazarai-demo.netlify.app

---

## What is Bazar.ai?

Bazar.ai helps business owners manage their money. You can:

- Record sales and expenses
- See where your money goes
- Get reports about your business
- Ask an AI assistant questions about your finances

The application works in three languages: English, Russian, and Kyrgyz.

---

## Features

### Dashboard
See your total income, expenses, and profit at a glance. Charts show you spending patterns over time.

### Transactions
Add, edit, and delete your business transactions. Filter by date, category, or type. Export your data to CSV files.

### Reports
Generate profit and loss reports for different time periods: week, month, quarter, or year.

### AI Assistant
Ask questions about your business in natural language. The AI uses your actual transaction data to give specific answers.

Examples:
- "What are my highest expenses?"
- "How much income did I get last month?"
- "Give me financial advice"

The AI understands English, Russian, and Kyrgyz.

### Security
- Auto-logout after 30 minutes of inactivity
- Password strength requirements
- Two-factor authentication option
- Data older than 365 days is automatically cleaned up

---

## Getting Started

### Requirements
- Node.js (version 16 or higher)
- A Gemini API key from Google

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sancar22-debug/Bazar.AI.git
cd Bazar.AI
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# Create a file named .env in the root folder
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key at: https://makersuite.google.com/app/apikey

4. Start the application:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

### Demo Accounts

You can try the app without creating an account:

**Tech Business Demo:**
- Email: demo@bazar.ai
- Password: demo123

**Small Business Demo (Kyrgyz):**
- Email: dordoi@bazar.ai
- Password: dordoi123

---

## Project Structure

```
src/
├── components/     # UI components
├── contexts/       # Global state (auth, language, transactions)
├── hooks/          # Custom React hooks
├── services/       # AI and RAG services
├── types/          # TypeScript definitions
└── utils/          # Helper functions
```

### Key Files

| File | Purpose |
|------|---------|
| `geminiService.ts` | Connects to Google Gemini AI |
| `ragService.ts` | Retrieves relevant transactions for AI context |
| `AuthContext.tsx` | User authentication and demo data |
| `LanguageContext.tsx` | Translations for EN/RU/KY |

---

## Technology

- **React 18** - User interface
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Chart.js** - Data visualization
- **Google Gemini AI** - Intelligent assistant

---

## Deployment

The application is deployed on Netlify. To deploy your own version:

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## Support

- Email: bazaraisup@gmail.com
- Issues: [GitHub Issues](https://github.com/Sancar22-debug/Bazar.AI/issues)

---

## License

This project is private. All rights reserved.

---

Made by [Sancar22-debug](https://github.com/Sancar22-debug)