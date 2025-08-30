import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyA3Zmveg4IBaAKJzGiMzx4wz8owJLX4w2U';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async analyzeFinancialData(query: string, transactionData: any, language: string = 'en', history: string = '') {
    const prompt = this.buildPrompt(query, transactionData, language, history);
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private buildPrompt(query: string, data: any, language: string, history: string): string {
    const languageInstructions = {
      en: 'Respond in English in a natural, conversational tone. Be helpful, engaging, and professional. Do NOT start with greetings like "Hello" or "Hi" - just answer the question directly. Use the EXACT numbers from the provided data.',
      ru: 'Отвечай на русском языке естественным, разговорным тоном. Будь полезным, вовлекающим и профессиональным. НЕ начинай с приветствий типа "Привет" или "Здравствуйте" - просто отвечай на вопрос напрямую. Используй ТОЧНЫЕ цифры из предоставленных данных.',
      ky: 'Кыргызча жооп бер, табигый, достук тон менен. Пайдалуу, кызыктуу жана кесипкөй бол. "Салам" же "Саламатсызбы" деген сыяктуу салам айтуу менен баштабай, суроого түздөн-түз жооп бер. Берилген маалыматтардан ТОЧКУ сандарды колдон.'
    };

    return `
You are an AI financial assistant for Bazar.ai, a business accounting application. You should respond naturally and conversationally, but with expertise in business finance and accounting for businesses in Kyrgyzstan.

CRITICAL: ${languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en}

Conversation so far (most recent last). Briefly acknowledge relevant prior facts when helpful to sound human, but do not repeat the entire history:
${history || 'No prior conversation available.'}

IMPORTANT: Use the EXACT numbers provided below. Do not make up or estimate any financial data.

${data.dataContext || 'Analyzing all transactions'}

Current Business Financial Data:
- Total Income: ${data.totalIncome} KGS
- Total Expenses: ${data.totalExpenses} KGS
- Net Profit: ${data.profit} KGS
- Number of Transactions: ${data.transactionCount}

Top Income Categories:
${data.topIncomeCategories?.map((cat: any) => `- ${cat.category}: ${cat.amount} KGS`).join('\n') || 'No income data available'}

Top Expense Categories:
${data.topExpenseCategories?.map((cat: any) => `- ${cat.category}: ${cat.amount} KGS`).join('\n') || 'No expense data available'}

Recent Transactions (Last 10):
${data.recentTransactions?.map((t: any) => `- ${t.type}: ${t.amount} KGS (${t.category}) - ${t.description}`).join('\n') || 'No recent transactions'}

Monthly Breakdown:
${Object.entries(data.monthlyData || {}).map(([month, data]: [string, any]) => 
  `- ${month}: Income ${data.income} KGS, Expenses ${data.expenses} KGS, Profit ${data.profit} KGS`
).join('\n') || 'No monthly data available'}

User Question: "${query}"

Guidelines for your response:
1. NEVER start with greetings - jump straight into answering the question
2. Be conversational and natural - no robotic or formal language
3. Use the EXACT financial data provided above to give specific, actionable insights
4. Reference specific numbers from their data (e.g., "Your total income of 450,000 KGS shows...")
5. Provide practical business advice relevant to Kyrgyzstan's business environment
6. Keep responses informative but conversational (2-4 sentences typically)
7. Use the specified language consistently throughout
8. Format currency amounts properly (e.g., "15,500 KGS")
9. Be encouraging and supportive about their business journey
10. If the data shows 0 or no transactions, acknowledge this and provide guidance on getting started
 11. When the user's message refers back to earlier context (e.g., "great to hear"), briefly acknowledge it before answering

Remember: You have access to their real financial data, so use specific numbers and insights from their actual transactions. Respond naturally like you're having a conversation with a business owner, but skip any greetings.
`;
  }

}

export const geminiService = new GeminiService();