
import { supabase } from './supabase';
import { FinanceState, Transaction, LongTermDebt, FutureGoal, RecurringIncome, RecurringExpense, Investment, AppSettings, AlertSettings, FamilyMember } from '../types';

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
            alertSettings,
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
            supabase.from('alert_settings').select('*').eq('user_id', user.id).maybeSingle(),
            supabase.from('dismissed_alerts').select('alert_identifier').eq('user_id', user.id)
        ]);

        const familyMembers = await supabase.from('family_members').select('*').eq('user_id', user.id);

        return {
            transactions: transactions.data || [],
            debts: debts.data || [],
            goals: goals.data || [],
            recurringIncomes: recurringIncomes.data || [],
            recurringExpenses: recurringExpenses.data || [],
            investments: investments.data || [],
            familyInfo: {
                familyName: profile.data?.family_name || '',
                members: familyMembers.data || []
            },
            appSettings: (settings.data as any) || { currency: 'EUR', language: 'Português', theme: 'light' },
            alertSettings: (alertSettings.data as any) || { commitmentDays: 7, goalThreshold: 90, budgetThreshold: 80 },
            dismissedAlerts: dismissedAlerts.data?.map(d => d.alert_identifier) || []
        };
    },

    // --- TRANSACTIONS ---
    async addTransaction(transaction: Omit<Transaction, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const { data, error } = await supabase.from('transactions').insert([{ ...transaction, user_id: user.id }]).select().single();
        if (error) throw error;
        return data;
    },
    async updateTransaction(transaction: Transaction) {
        const { data, error } = await supabase.from('transactions').update(transaction).eq('id', transaction.id).select().single();
        if (error) throw error;
        return data;
    },
    async deleteTransaction(id: string) {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
    },

    // --- FAMILY MEMBERS ---
    async addMember(member: Omit<FamilyMember, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const { data, error } = await supabase.from('family_members').insert([{ ...member, user_id: user.id }]).select().single();
        if (error) throw error;
        return data;
    },
    async updateMember(member: FamilyMember) {
        const { data, error } = await supabase.from('family_members').update(member).eq('id', member.id).select().single();
        if (error) throw error;
        return data;
    },
    async deleteMember(id: string) {
        const { error } = await supabase.from('family_members').delete().eq('id', id);
        if (error) throw error;
    },

    // --- RECURRING INCOMES ---
    async addRecurringIncome(income: Omit<RecurringIncome, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const { data, error } = await supabase.from('recurring_incomes').insert([{ ...income, user_id: user.id }]).select().single();
        if (error) throw error;
        return data;
    },
    async updateRecurringIncome(income: RecurringIncome) {
        const { data, error } = await supabase.from('recurring_incomes').update(income).eq('id', income.id).select().single();
        if (error) throw error;
        return data;
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
        const { data, error } = await supabase.from('recurring_expenses').insert([{ ...expense, user_id: user.id }]).select().single();
        if (error) throw error;
        return data;
    },
    async updateRecurringExpense(expense: RecurringExpense) {
        const { data, error } = await supabase.from('recurring_expenses').update(expense).eq('id', expense.id).select().single();
        if (error) throw error;
        return data;
    },
    async deleteRecurringExpense(id: string) {
        const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
        if (error) throw error;
    },

    // --- DEBTS ---
    async addDebt(debt: Omit<LongTermDebt, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const { data, error } = await supabase.from('long_term_debts').insert([{ ...debt, user_id: user.id }]).select().single();
        if (error) throw error;
        return data;
    },
    async updateDebt(debt: LongTermDebt) {
        const { data, error } = await supabase.from('long_term_debts').update(debt).eq('id', debt.id).select().single();
        if (error) throw error;
        return data;
    },
    async deleteDebt(id: string) {
        const { error } = await supabase.from('long_term_debts').delete().eq('id', id);
        if (error) throw error;
    },

    // --- GOALS ---
    async addGoal(goal: Omit<FutureGoal, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const { data, error } = await supabase.from('future_goals').insert([{ ...goal, user_id: user.id }]).select().single();
        if (error) throw error;
        return data;
    },
    async updateGoal(goal: FutureGoal) {
        const { data, error } = await supabase.from('future_goals').update(goal).eq('id', goal.id).select().single();
        if (error) throw error;
        return data;
    },
    async deleteGoal(id: string) {
        const { error } = await supabase.from('future_goals').delete().eq('id', id);
        if (error) throw error;
    },

    // --- INVESTMENTS ---
    async addInvestment(inv: Omit<Investment, 'id'>) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const { data, error } = await supabase.from('investments').insert([{ ...inv, user_id: user.id }]).select().single();
        if (error) throw error;
        return data;
    },
    async updateInvestment(inv: Investment) {
        const { data, error } = await supabase.from('investments').update(inv).eq('id', inv.id).select().single();
        if (error) throw error;
        return data;
    },
    async deleteInvestment(id: string) {
        const { error } = await supabase.from('investments').delete().eq('id', id);
        if (error) throw error;
    },

    // --- SETTINGS ---
    async updateAppSettings(settings: AppSettings) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const { error } = await supabase.from('app_settings').upsert({ ...settings, user_id: user.id });
        if (error) throw error;
    },
    async updateAlertSettings(settings: AlertSettings) {
        const user = await this.getCurrentUser();
        if (!user) return;
        const { error } = await supabase.from('alert_settings').upsert({ ...settings, user_id: user.id });
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
