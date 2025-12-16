import { GoogleGenerativeAI } from '@google/generative-ai';
import { ragService } from './ragService';
import { Transaction } from '../types';

// Use environment variable for API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    if (API_KEY) {
      this.genAI = new GoogleGenerativeAI(API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    } else {
      console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.');
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!this.model;
  }

  /**
   * Analyze financial data with RAG-enhanced context
   */
  async analyzeFinancialData(
    query: string,
    transactionData: any,
    language: string = 'en',
    history: string = '',
    transactions: Transaction[] = []
  ) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    // Use RAG to retrieve relevant transactions for the query
    const ragResult = ragService.retrieveRelevantData(query, transactions, language);

    // Perform deep analysis if we have transactions
    const analysis = transactions.length > 0 ? ragService.analyzeTransactions(transactions) : null;

    // Build enhanced prompt with RAG context
    const prompt = this.buildPrompt(query, transactionData, language, history, ragResult, analysis);

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private buildPrompt(
    query: string,
    data: any,
    language: string,
    history: string,
    ragResult?: { relevantTransactions: any[]; insights: string[]; summary: string },
    analysis?: any
  ): string {
    const languageInstructions = {
      en: 'Respond in English in a natural, conversational tone. Be helpful, engaging, and professional. Do NOT start with greetings like "Hello" or "Hi" - just answer the question directly. Use the EXACT numbers from the provided data.',
      ru: 'Отвечай на русском языке естественным, разговорным тоном. Будь полезным, вовлекающим и профессиональным. НЕ начинай с приветствий типа "Привет" или "Здравствуйте" - просто отвечай на вопрос напрямую. Используй ТОЧНЫЕ цифры из предоставленных данных.',
      ky: 'Кыргызча жооп бер, табигый, достук тон менен. Пайдалуу, кызыктуу жана кесипкөй бол. "Салам" же "Саламатсызбы" деген сыяктуу салам айтуу менен баштабай, суроого түздөн-түз жооп бер. Берилген маалыматтардан ТОЧКУ сандарды колдон.'
    };

    // Build RAG context section
    let ragContext = '';
    if (ragResult && ragResult.relevantTransactions.length > 0) {
      ragContext = `
=== RETRIEVED TRANSACTIONS (RAG) ===
${ragResult.summary}

Key Insights from Retrieved Data:
${ragResult.insights.map(i => `- ${i}`).join('\n')}
`;
    }

    // Build analysis context
    let analysisContext = '';
    if (analysis) {
      analysisContext = `
=== DEEP ANALYSIS ===
Top 5 Expenses:
${analysis.topExpenses.slice(0, 5).map((t: any, i: number) =>
        `${i + 1}. ${t.category}: ${t.amount.toLocaleString()} KGS - "${t.description}"`
      ).join('\n') || 'No expenses recorded'}

Top 5 Income Sources:
${analysis.topIncome.slice(0, 5).map((t: any, i: number) =>
        `${i + 1}. ${t.category}: ${t.amount.toLocaleString()} KGS - "${t.description}"`
      ).join('\n') || 'No income recorded'}

Spending Patterns:
${analysis.patterns.join('\n') || 'No patterns identified yet'}

Time Analysis:
- Busiest Day: ${analysis.timeAnalysis.busiestDay}
- Busiest Month: ${analysis.timeAnalysis.busiestMonth}
- Average Daily Activity: ${analysis.timeAnalysis.averageDaily.toFixed(0)} KGS
`;
    }

    return `
You are an AI financial assistant for Bazar.ai, a business accounting application. You have access to the user's actual transaction data through a RAG (Retrieval Augmented Generation) system.

CRITICAL: ${languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en}

Conversation so far (most recent last). Briefly acknowledge relevant prior facts when helpful to sound human, but do not repeat the entire history:
${history || 'No prior conversation available.'}

IMPORTANT: Use the EXACT numbers provided below. Do not make up or estimate any financial data.

${data.dataContext || 'Analyzing all transactions'}

=== OVERALL FINANCIAL DATA ===
- Total Income: ${data.totalIncome} KGS
- Total Expenses: ${data.totalExpenses} KGS
- Net Profit: ${data.profit} KGS
- Number of Transactions: ${data.transactionCount}

Top Income Categories:
${data.topIncomeCategories?.map((cat: any) => `- ${cat.category}: ${cat.amount} KGS`).join('\n') || 'No income data available'}

Top Expense Categories:
${data.topExpenseCategories?.map((cat: any) => `- ${cat.category}: ${cat.amount} KGS`).join('\n') || 'No expense data available'}
${ragContext}
${analysisContext}

Monthly Breakdown:
${Object.entries(data.monthlyData || {}).map(([month, monthData]: [string, any]) =>
      `- ${month}: Income ${monthData.income} KGS, Expenses ${monthData.expenses} KGS, Profit ${monthData.profit} KGS`
    ).join('\n') || 'No monthly data available'}

User Question: "${query}"

Guidelines for your response:
1. NEVER start with greetings - jump straight into answering the question
2. Be conversational and natural - no robotic or formal language
3. Use the EXACT financial data provided above, especially from the RAG-retrieved transactions
4. Reference specific transactions when relevant (e.g., "Your highest expense was 15,000 KGS for equipment on Dec 10")
5. Provide practical business advice relevant to Kyrgyzstan's business environment
6. Keep responses informative but conversational (2-4 sentences typically)
7. Use the specified language consistently throughout
8. Format currency amounts properly (e.g., "15,500 KGS")
9. Be encouraging and supportive about their business journey
10. If the data shows 0 or no transactions, acknowledge this and provide guidance on getting started
11. When the user's message refers back to earlier context (e.g., "great to hear"), briefly acknowledge it before answering
12. When asked about specific categories or time periods, use the RAG-retrieved data to give precise answers

Remember: You have access to their real financial data through RAG, so use specific numbers and insights from their actual transactions. Respond naturally like you're having a conversation with a business owner, but skip any greetings.
`;
  }
}

export const geminiService = new GeminiService();
