import { FinanceState } from '../types';

export const calculateAlertCount = (state: FinanceState): number => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const commitmentDaysThreshold = state.alertSettings?.commitmentDays || 7;
    const goalThresholdPct = state.alertSettings?.goalThreshold || 90;
    const budgetThresholdPct = state.alertSettings?.budgetThreshold || 80;
    const dismissedAlerts = state.dismissedAlerts || [];

    let alertCount = 0;

    // 1. Upcoming Commitments - Recurring Expenses
    state.recurringExpenses.forEach(exp => {
        let daysUntil = exp.dayOfMonth - currentDay;
        if (daysUntil >= 0 && daysUntil <= commitmentDaysThreshold) {
            const alertId = `exp-${exp.id}`;
            if (!dismissedAlerts.includes(alertId)) {
                alertCount++;
            }
        }
    });

    // 2. Upcoming Commitments - Debts
    state.debts.forEach(debt => {
        if (debt.dayOfMonth) {
            let daysUntil = debt.dayOfMonth - currentDay;
            if (daysUntil >= 0 && daysUntil <= commitmentDaysThreshold) {
                const alertId = `debt-${debt.id}`;
                if (!dismissedAlerts.includes(alertId)) {
                    alertCount++;
                }
            }
        }
    });

    // 3. Goal Progress
    state.goals.forEach(goal => {
        const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
        if (progress >= goalThresholdPct && progress < 100) {
            const alertId = `goal-${goal.id}`;
            if (!dismissedAlerts.includes(alertId)) {
                alertCount++;
            }
        }
    });

    // 4. Budget Warning
    const totalIncome = (state.recurringIncomes || []).reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpensesMonth = state.transactions
        .filter(tx => {
            const d = new Date(tx.date);
            return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && tx.type === 'saida';
        })
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    if (totalIncome > 0) {
        const ratio = (totalExpensesMonth / totalIncome) * 100;
        if (ratio > budgetThresholdPct) {
            const alertId = 'budget-warning';
            if (!dismissedAlerts.includes(alertId)) {
                alertCount++;
            }
        }
    }

    return alertCount;
};

