
import { supabase } from './supabase';
import { FinanceState, Transaction, LongTermDebt, FutureGoal, RecurringIncome, RecurringExpense, Investment, AppSettings, AlertSettings, FamilyMember } from '../types';

// Helper to convert camelCase to snake_case
const toSnakeCase = (obj: any) => {
    const newObj: any = {};
    for (const key in obj) {
        let snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        // Mapeamento específico para colunas de despesas recorrentes que têm nomes diferentes no SQL
        if (snakeKey === 'month') snakeKey = 'last_processed_month';
        if (snakeKey === 'year') snakeKey = 'last_processed_year';
        newObj[snakeKey] = obj[key];
    }
    return newObj;
};

// Helper to convert snake_case to camelCase
const toCamelCase = (obj: any) => {
    if (!obj) return obj;
    const newObj: any = {};
    for (const key in obj) {
        let camelKey = key.replace(/(_\w)/g, m => m[1].toUpperCase());
        // Mapeamento inverso
        if (camelKey === 'lastProcessedMonth') camelKey = 'month';
        if (camelKey === 'lastProcessedYear') camelKey = 'year';
        newObj[camelKey] = obj[key];
    }
    return newObj;
};

export const supabaseService = {
    // --- AUTH ---
    async login(email: string, password?: string) {
        if (password) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw error;
            return data;
        }
    },

    async logout() {
        await supabase.auth.signOut();
    },

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    async checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    },

    // --- DATA LOADING ---
    async loadFinanceData(): Promise<FinanceState | null> {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const [
            transactions,
            debts,
            goals,
            recurringIncomes,
            recurringExpenses,
            investments,
            profile,
            settings,
            dismissedAlerts
        ] = await Promise.all([
            supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
            supabase.from('long_term_debts').select('*').eq('user_id', user.id),
            supabase.from('future_goals').select('*').eq('user_id', user.id),
            supabase.from('recurring_incomes').select('*').eq('user_id', user.id),
            supabase.from('recurring_expenses').select('*').eq('user_id', user.id),
            supabase.from('investments').select('*').eq('user_id', user.id),
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('app_settings').select('*').eq('user_id', user.id).maybeSingle(),
            supabase.from('dismissed_alerts').select('alert_identifier').eq('user_id', user.id)
        ]);

        const familyMembers = await supabase.from('family_members').select('*').eq('user_id', user.id);

        // Map results from snake_case to camelCase
        const mappedTransactions = (transactions.data || []).map(toCamelCase);
        const mappedDebts = (debts.data || []).map(toCamelCase);
        const mappedGoals = (goals.data || []).map(toCamelCase);
        const mappedIncomes = (recurringIncomes.data || []).map(toCamelCase);
        const mappedExpenses = (recurringExpenses.data || []).map(toCamelCase);
        const mappedInvestments = (investments.data || []).map(toCamelCase);
        const mappedMembers = (familyMembers.data || []).map(toCamelCase);
        const mappedSettings = toCamelCase(settings.data);

        // Extract alert settings from app_settings
        const alertSettings: AlertSettings = {
            commitmentDays: mappedSettings?.commitmentDays || 5,
            goalThreshold: Number(mappedSettings?.goalThreshold) || 90,
            budgetThreshold: Number(mappedSettings?.budgetThreshold) || 80
        };

        const appSettings: AppSettings = {
            currency: mappedSettings?.currency || 'EUR',
            language: mappedSettings?.language || 'Português',
            theme: mappedSettings?.theme || 'light'
        };

        return {
            transactions: mappedTransactions,
            debts: mappedDebts,
            goals: mappedGoals,
            recurringIncomes: mappedIncomes,
            recurringExpenses: mappedExpenses,
            investments: mappedInvestments,
            familyInfo: {
                familyName: profile.data?.family_name || '',
                members: mappedMembers
            },
            appSettings,
            alertSettings,
            dismissedAlerts: dismissedAlerts.data?.map(d => d.alert_identifier) || []
        };
    },

    // --- TRANSACTIONS ---
    async addTransaction(transaction: Omit<Transaction, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const snakeTx = toSnakeCase(transaction);
        const { data, error } = await supabase.from('transactions').insert([{ ...snakeTx, user_id: user.id }]).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async updateTransaction(transaction: Transaction) {
        const snakeTx = toSnakeCase(transaction);
        const { data, error } = await supabase.from('transactions').update(snakeTx).eq('id', transaction.id).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async deleteTransaction(id: string) {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
    },

    // --- FAMILY MEMBERS ---
    async addMember(member: Omit<FamilyMember, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const snakeMember = toSnakeCase(member);
        const { data, error } = await supabase.from('family_members').insert([{ ...snakeMember, user_id: user.id }]).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async updateMember(member: FamilyMember) {
        const snakeMember = toSnakeCase(member);
        const { data, error } = await supabase.from('family_members').update(snakeMember).eq('id', member.id).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async deleteMember(id: string) {
        const { error } = await supabase.from('family_members').delete().eq('id', id);
        if (error) throw error;
    },

    // --- RECURRING INCOMES ---
    async addRecurringIncome(income: Omit<RecurringIncome, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const snakeIncome = toSnakeCase(income);
        const { data, error } = await supabase.from('recurring_incomes').insert([{ ...snakeIncome, user_id: user.id }]).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async updateRecurringIncome(income: RecurringIncome) {
        const snakeIncome = toSnakeCase(income);
        const { data, error } = await supabase.from('recurring_incomes').update(snakeIncome).eq('id', income.id).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async deleteRecurringIncome(id: string) {
        const { error } = await supabase.from('recurring_incomes').delete().eq('id', id);
        if (error) throw error;
    },
    async deleteRecurringIncomeByMember(memberId: string) {
        const { error } = await supabase.from('recurring_incomes').delete().eq('member_id', memberId);
        if (error) throw error;
    },

    // --- RECURRING EXPENSES ---
    async addRecurringExpense(expense: Omit<RecurringExpense, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const snakeExpense = toSnakeCase(expense);
        const { data, error } = await supabase.from('recurring_expenses').insert([{ ...snakeExpense, user_id: user.id }]).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async updateRecurringExpense(expense: RecurringExpense) {
        const snakeExpense = toSnakeCase(expense);
        const { data, error } = await supabase.from('recurring_expenses').update(snakeExpense).eq('id', expense.id).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async deleteRecurringExpense(id: string) {
        const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
        if (error) throw error;
    },

    // --- DEBTS ---
    async addDebt(debt: Omit<LongTermDebt, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const snakeDebt = toSnakeCase(debt);
        const { data, error } = await supabase.from('long_term_debts').insert([{ ...snakeDebt, user_id: user.id }]).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async updateDebt(debt: LongTermDebt) {
        const snakeDebt = toSnakeCase(debt);
        const { data, error } = await supabase.from('long_term_debts').update(snakeDebt).eq('id', debt.id).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async deleteDebt(id: string) {
        const { error } = await supabase.from('long_term_debts').delete().eq('id', id);
        if (error) throw error;
    },

    // --- GOALS ---
    async addGoal(goal: Omit<FutureGoal, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const snakeGoal = toSnakeCase(goal);
        const { data, error } = await supabase.from('future_goals').insert([{ ...snakeGoal, user_id: user.id }]).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async updateGoal(goal: FutureGoal) {
        const snakeGoal = toSnakeCase(goal);
        const { data, error } = await supabase.from('future_goals').update(snakeGoal).eq('id', goal.id).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async deleteGoal(id: string) {
        const { error } = await supabase.from('future_goals').delete().eq('id', id);
        if (error) throw error;
    },

    // --- INVESTMENTS ---
    async addInvestment(inv: Omit<Investment, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const snakeInv = toSnakeCase(inv);
        const { data, error } = await supabase.from('investments').insert([{ ...snakeInv, user_id: user.id }]).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async updateInvestment(inv: Investment) {
        const snakeInv = toSnakeCase(inv);
        const { data, error } = await supabase.from('investments').update(snakeInv).eq('id', inv.id).select().single();
        if (error) throw error;
        return toCamelCase(data);
    },
    async deleteInvestment(id: string) {
        const { error } = await supabase.from('investments').delete().eq('id', id);
        if (error) throw error;
    },

    // --- SETTINGS ---
    async updateAppSettings(settings: AppSettings) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const snakeSettings = toSnakeCase(settings);
        const { error } = await supabase.from('app_settings').upsert({ ...snakeSettings, user_id: user.id });
        if (error) throw error;
    },
    async updateAlertSettings(settings: AlertSettings) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const snakeSettings = toSnakeCase(settings);
        const { error } = await supabase.from('app_settings').upsert({ ...snakeSettings, user_id: user.id });
        if (error) throw error;
    },
    async updateProfile(familyName: string) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const { error } = await supabase.from('profiles').update({ family_name: familyName }).eq('id', user.id);
        if (error) throw error;
    },
    async dismissAlert(alertIdentifier: string) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const { error } = await supabase.from('dismissed_alerts').insert([{ user_id: user.id, alert_identifier: alertIdentifier }]);
        if (error) throw error;
    }
};
