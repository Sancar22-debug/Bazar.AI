import { Transaction } from '../types';

export interface RAGQuery {
    query: string;
    language: string;
}

export interface RAGResult {
    relevantTransactions: Transaction[];
    insights: string[];
    summary: string;
}

interface TransactionAnalysis {
    topExpenses: Transaction[];
    topIncome: Transaction[];
    categoryBreakdown: Record<string, { total: number; count: number; transactions: Transaction[] }>;
    timeAnalysis: {
        busiestDay: string;
        busiestMonth: string;
        averageDaily: number;
    };
    patterns: string[];
}

class RAGService {
    /**
     * Analyze query intent to determine what data to retrieve
     */
    private analyzeQueryIntent(query: string, language: string): {
        searchTerms: string[];
        categories: string[];
        timeRange: { start: Date | null; end: Date | null };
        transactionType: 'income' | 'expense' | 'all';
        analysisType: 'top' | 'bottom' | 'search' | 'pattern' | 'category' | 'general';
        limit: number;
    } {
        const lowerQuery = query.toLowerCase();

        // Keywords for different languages
        const keywords = {
            en: {
                expense: ['expense', 'spending', 'spent', 'cost', 'paid', 'payment', 'buy', 'bought'],
                income: ['income', 'revenue', 'earned', 'received', 'sale', 'sold', 'profit'],
                top: ['highest', 'top', 'biggest', 'largest', 'most', 'maximum'],
                bottom: ['lowest', 'smallest', 'least', 'minimum', 'cheapest'],
                today: ['today'],
                yesterday: ['yesterday'],
                week: ['week', 'weekly', 'this week', 'last week'],
                month: ['month', 'monthly', 'this month', 'last month'],
                year: ['year', 'yearly', 'this year', 'last year'],
                pattern: ['pattern', 'trend', 'analysis', 'analyze', 'insight'],
                category: ['category', 'type', 'kind']
            },
            ru: {
                expense: ['расход', 'траты', 'потратил', 'оплата', 'купил', 'покупка'],
                income: ['доход', 'выручка', 'заработал', 'получил', 'продажа', 'продал'],
                top: ['самый', 'наибольший', 'максимальный', 'больше всего'],
                bottom: ['наименьший', 'минимальный', 'меньше всего'],
                today: ['сегодня'],
                yesterday: ['вчера'],
                week: ['неделя', 'недели', 'эта неделя', 'прошлая неделя'],
                month: ['месяц', 'месяца', 'этот месяц', 'прошлый месяц'],
                year: ['год', 'года', 'этот год', 'прошлый год'],
                pattern: ['анализ', 'тренд', 'паттерн', 'аналитика'],
                category: ['категория', 'тип', 'вид']
            },
            ky: {
                expense: ['чыгым', 'чыгаша', 'төлөм', 'сатып алуу'],
                income: ['киреше', 'сатуу', 'табыш', 'пайда'],
                top: ['эң чоң', 'эң көп', 'максималдуу'],
                bottom: ['эң кичине', 'эң аз', 'минималдуу'],
                today: ['бүгүн'],
                yesterday: ['кечээ'],
                week: ['жума', 'бул жума', 'өткөн жума'],
                month: ['ай', 'бул ай', 'өткөн ай'],
                year: ['жыл', 'бул жыл', 'өткөн жыл'],
                pattern: ['анализ', 'тренд'],
                category: ['категория', 'түр']
            }
        };

        const lang = keywords[language as keyof typeof keywords] || keywords.en;

        // Determine transaction type
        let transactionType: 'income' | 'expense' | 'all' = 'all';
        if (lang.expense.some(w => lowerQuery.includes(w))) transactionType = 'expense';
        if (lang.income.some(w => lowerQuery.includes(w))) transactionType = 'income';

        // Determine analysis type
        let analysisType: 'top' | 'bottom' | 'search' | 'pattern' | 'category' | 'general' = 'general';
        if (lang.top.some(w => lowerQuery.includes(w))) analysisType = 'top';
        else if (lang.bottom.some(w => lowerQuery.includes(w))) analysisType = 'bottom';
        else if (lang.pattern.some(w => lowerQuery.includes(w))) analysisType = 'pattern';
        else if (lang.category.some(w => lowerQuery.includes(w))) analysisType = 'category';

        // Determine time range
        let timeRange: { start: Date | null; end: Date | null } = { start: null, end: null };
        const now = new Date();

        if (lang.today.some(w => lowerQuery.includes(w))) {
            timeRange.start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            timeRange.end = now;
        } else if (lang.yesterday.some(w => lowerQuery.includes(w))) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            timeRange.start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
            timeRange.end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
        } else if (lang.week.some(w => lowerQuery.includes(w))) {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            timeRange.start = weekAgo;
            timeRange.end = now;
        } else if (lang.month.some(w => lowerQuery.includes(w))) {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            timeRange.start = monthAgo;
            timeRange.end = now;
        } else if (lang.year.some(w => lowerQuery.includes(w))) {
            const yearAgo = new Date(now);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            timeRange.start = yearAgo;
            timeRange.end = now;
        }

        // Extract potential search terms (categories, descriptions)
        const commonCategories = [
            'sales', 'services', 'consulting', 'software', 'rent', 'salary', 'salaries',
            'utilities', 'marketing', 'transport', 'equipment', 'materials',
            'продажи', 'услуги', 'консалтинг', 'аренда', 'зарплата', 'маркетинг', 'транспорт',
            'сатуу', 'кызматтар', 'ижара', 'айлык', 'маркетинг'
        ];

        const searchTerms = commonCategories.filter(cat => lowerQuery.includes(cat.toLowerCase()));

        return {
            searchTerms,
            categories: searchTerms,
            timeRange,
            transactionType,
            analysisType,
            limit: 10
        };
    }

    /**
     * Retrieve and analyze transactions based on query
     */
    retrieveRelevantData(query: string, transactions: Transaction[], language: string = 'en'): RAGResult {
        const intent = this.analyzeQueryIntent(query, language);
        let filtered = [...transactions];
        const insights: string[] = [];

        // Filter by transaction type
        if (intent.transactionType !== 'all') {
            filtered = filtered.filter(t => t.type === intent.transactionType);
        }

        // Filter by time range
        if (intent.timeRange.start && intent.timeRange.end) {
            filtered = filtered.filter(t => {
                const date = new Date(t.timestamp);
                return date >= intent.timeRange.start! && date <= intent.timeRange.end!;
            });
        }

        // Filter by categories/search terms
        if (intent.searchTerms.length > 0) {
            filtered = filtered.filter(t =>
                intent.searchTerms.some(term =>
                    t.category.toLowerCase().includes(term.toLowerCase()) ||
                    t.description.toLowerCase().includes(term.toLowerCase())
                )
            );
        }

        // Sort based on analysis type
        if (intent.analysisType === 'top') {
            filtered.sort((a, b) => b.amount - a.amount);
        } else if (intent.analysisType === 'bottom') {
            filtered.sort((a, b) => a.amount - b.amount);
        } else {
            // Default: sort by date (newest first)
            filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }

        // Limit results
        const relevantTransactions = filtered.slice(0, intent.limit);

        // Generate insights
        if (relevantTransactions.length > 0) {
            const total = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
            const avg = total / relevantTransactions.length;

            insights.push(`Found ${relevantTransactions.length} relevant transactions`);
            insights.push(`Total amount: ${total.toLocaleString()} KGS`);
            insights.push(`Average amount: ${avg.toFixed(0)} KGS`);

            // Category breakdown for relevant transactions
            const categories = relevantTransactions.reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

            const topCategory = Object.entries(categories).sort(([, a], [, b]) => b - a)[0];
            if (topCategory) {
                insights.push(`Top category: ${topCategory[0]} (${topCategory[1].toLocaleString()} KGS)`);
            }
        } else {
            insights.push('No transactions found matching the query criteria');
        }

        // Generate summary for AI context
        const summary = this.generateContextSummary(relevantTransactions, intent, language);

        return {
            relevantTransactions,
            insights,
            summary
        };
    }

    /**
     * Perform deep analysis of all transactions
     */
    analyzeTransactions(transactions: Transaction[]): TransactionAnalysis {
        const expenses = transactions.filter(t => t.type === 'expense');
        const income = transactions.filter(t => t.type === 'income');

        // Top expenses and income
        const topExpenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
        const topIncome = [...income].sort((a, b) => b.amount - a.amount).slice(0, 5);

        // Category breakdown
        const categoryBreakdown: Record<string, { total: number; count: number; transactions: Transaction[] }> = {};
        transactions.forEach(t => {
            if (!categoryBreakdown[t.category]) {
                categoryBreakdown[t.category] = { total: 0, count: 0, transactions: [] };
            }
            categoryBreakdown[t.category].total += t.amount;
            categoryBreakdown[t.category].count += 1;
            categoryBreakdown[t.category].transactions.push(t);
        });

        // Time analysis
        const dayTotals: Record<string, number> = {};
        const monthTotals: Record<string, number> = {};

        transactions.forEach(t => {
            const date = new Date(t.timestamp);
            const dayKey = date.toISOString().split('T')[0];
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            dayTotals[dayKey] = (dayTotals[dayKey] || 0) + t.amount;
            monthTotals[monthKey] = (monthTotals[monthKey] || 0) + t.amount;
        });

        const busiestDay = Object.entries(dayTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
        const busiestMonth = Object.entries(monthTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
        const totalDays = Object.keys(dayTotals).length || 1;
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        const averageDaily = totalAmount / totalDays;

        // Identify patterns
        const patterns: string[] = [];

        // Check for recurring expenses
        const categoryFrequency = Object.entries(categoryBreakdown)
            .filter(([, data]) => data.count >= 3)
            .map(([cat, data]) => `${cat}: ${data.count} transactions`);

        if (categoryFrequency.length > 0) {
            patterns.push(`Recurring categories: ${categoryFrequency.slice(0, 3).join(', ')}`);
        }

        // Check expense vs income ratio
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const ratio = totalIncome > 0 ? totalExpenses / totalIncome : 0;

        if (ratio > 0.9) {
            patterns.push('High expense-to-income ratio (above 90%)');
        } else if (ratio < 0.5) {
            patterns.push('Good expense control (below 50% of income)');
        }

        return {
            topExpenses,
            topIncome,
            categoryBreakdown,
            timeAnalysis: {
                busiestDay,
                busiestMonth,
                averageDaily
            },
            patterns
        };
    }

    /**
     * Generate a context summary for the AI prompt
     */
    private generateContextSummary(
        transactions: Transaction[],
        _intent: ReturnType<typeof this.analyzeQueryIntent>,
        _language: string
    ): string {
        if (transactions.length === 0) {
            return 'No matching transactions found for the query.';
        }

        const lines: string[] = [];
        lines.push(`Retrieved ${transactions.length} transactions matching the query:`);

        // Add transaction details
        transactions.slice(0, 5).forEach((t, i) => {
            const date = new Date(t.timestamp).toLocaleDateString();
            lines.push(`${i + 1}. [${t.type.toUpperCase()}] ${t.category}: ${t.amount.toLocaleString()} KGS - "${t.description}" (${date})`);
        });

        if (transactions.length > 5) {
            lines.push(`... and ${transactions.length - 5} more transactions`);
        }

        // Add aggregates
        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        lines.push(`\nAggregates for retrieved data:`);
        lines.push(`- Total: ${total.toLocaleString()} KGS`);
        if (incomeTotal > 0) lines.push(`- Income: ${incomeTotal.toLocaleString()} KGS`);
        if (expenseTotal > 0) lines.push(`- Expenses: ${expenseTotal.toLocaleString()} KGS`);

        return lines.join('\n');
    }

    /**
     * Search transactions by keyword
     */
    searchByKeyword(transactions: Transaction[], keyword: string): Transaction[] {
        const lowerKeyword = keyword.toLowerCase();
        return transactions.filter(t =>
            t.description.toLowerCase().includes(lowerKeyword) ||
            t.category.toLowerCase().includes(lowerKeyword)
        );
    }

    /**
     * Get transactions for a specific category
     */
    getByCategory(transactions: Transaction[], category: string): Transaction[] {
        return transactions.filter(t =>
            t.category.toLowerCase() === category.toLowerCase()
        );
    }

    /**
     * Get transactions within a date range
     */
    getByDateRange(transactions: Transaction[], start: Date, end: Date): Transaction[] {
        return transactions.filter(t => {
            const date = new Date(t.timestamp);
            return date >= start && date <= end;
        });
    }

    /**
     * Get transactions within an amount range
     */
    getByAmountRange(transactions: Transaction[], min: number, max: number): Transaction[] {
        return transactions.filter(t => t.amount >= min && t.amount <= max);
    }
}

export const ragService = new RAGService();
