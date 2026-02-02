
import React from 'react';
import { FinanceState } from '../types';
import { TranslationType } from '../translations';
import SectionCard from './ui/SectionCard';
import ItemRow from './ui/ItemRow';
import { Bell, Calendar, Target, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface AlertsPageProps {
    state: FinanceState;
    currencySymbol: string;
    t: TranslationType;
    locale: string;
    onDismissAlert: (alertId: string) => void;
}

const AlertsPage: React.FC<AlertsPageProps> = ({ state, currencySymbol, t, locale, onDismissAlert }) => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const commitmentDaysThreshold = state.alertSettings?.commitmentDays || 7;
    const goalThresholdPct = state.alertSettings?.goalThreshold || 90;
    const budgetThresholdPct = state.alertSettings?.budgetThreshold || 80;
    const dismissedAlerts = state.dismissedAlerts || [];

    const alerts: any[] = [];

    // 1. Upcoming Commitments
    state.recurringExpenses.forEach(exp => {
        let daysUntil = exp.dayOfMonth - currentDay;

        // Simplistic check for same month
        if (daysUntil >= 0 && daysUntil <= commitmentDaysThreshold) {
            alerts.push({
                id: `exp-${exp.id}`,
                type: 'commitment',
                title: exp.name,
                subtitle: `${t.alerts.dueIn} ${daysUntil === 0 ? t.alerts.today : daysUntil === 1 ? t.alerts.tomorrow : `${daysUntil} ${t.alerts.days}`}`,
                value: `${exp.amount.toLocaleString(locale)}${currencySymbol}`,
                icon: <Bell className="text-rose-500" />,
                variant: 'rose'
            });
        }
    });

    state.debts.forEach(debt => {
        if (debt.dayOfMonth) {
            let daysUntil = debt.dayOfMonth - currentDay;
            if (daysUntil >= 0 && daysUntil <= commitmentDaysThreshold) {
                alerts.push({
                    id: `debt-${debt.id}`,
                    type: 'commitment',
                    title: debt.name,
                    subtitle: `${t.alerts.dueIn} ${daysUntil === 0 ? t.alerts.today : daysUntil === 1 ? t.alerts.tomorrow : `${daysUntil} ${t.alerts.days}`}`,
                    value: `${debt.monthlyPayment.toLocaleString(locale)}${currencySymbol}`,
                    icon: <Bell className="text-rose-500" />,
                    variant: 'rose'
                });
            }
        }
    });

    // 2. Goal Progress
    state.goals.forEach(goal => {
        const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
        if (progress >= goalThresholdPct && progress < 100) {
            alerts.push({
                id: `goal-${goal.id}`,
                type: 'goal',
                title: goal.name,
                subtitle: `${t.alerts.reached} ${progress.toFixed(0)}% ${t.alerts.ofGoal}`,
                value: `${(Number(goal.targetAmount) - Number(goal.currentAmount)).toLocaleString(locale)}${currencySymbol} ${t.future.remaining.toLowerCase()}`,
                icon: <Bell className="text-rose-500" />,
                variant: 'rose'
            });
        }
    });

    // 3. Budget Warning
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
            alerts.push({
                id: 'budget-warning',
                type: 'budget',
                title: t.alerts.budgetWarning,
                subtitle: `${t.alerts.spendingHigh} ${ratio.toFixed(0)}% ${t.alerts.ofIncome}`,
                value: `${totalExpensesMonth.toLocaleString(locale)}${currencySymbol}`,
                icon: <AlertTriangle className="text-rose-500" />,
                variant: 'rose'
            });
        }
    }

    // Filter out dismissed alerts
    const activeAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <SectionCard
                variant="slate"
                title={t.alerts.title}
                icon={<Bell size={120} className="opacity-10" />}
            >
                <div className="space-y-4">
                    {activeAlerts.length > 0 ? (
                        activeAlerts.map(alert => (
                            <div key={alert.id} className="relative group">
                                <ItemRow
                                    icon={alert.icon}
                                    title={alert.title}
                                    subtitle={alert.subtitle}
                                    value={alert.value}
                                    variant={alert.variant}
                                />
                                <button
                                    onClick={() => onDismissAlert(alert.id)}
                                    className="absolute top-1/2 -translate-y-1/2 right-4 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl flex items-center gap-2 opacity-0 group-hover:opacity-100"
                                    title={t.common.dismiss || 'Dispensar'}
                                >
                                    <X size={14} />
                                    {t.common.dismiss || 'Dispensar'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-slate-400">
                            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20 text-emerald-500" />
                            <p className="text-sm font-bold uppercase tracking-widest">{t.alerts.noAlerts}</p>
                        </div>
                    )}
                </div>
            </SectionCard>
        </div>
    );
};

export default AlertsPage;
