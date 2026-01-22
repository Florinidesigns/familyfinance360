
import { useState, useCallback } from 'react';
import { FinanceState, Transaction, LongTermDebt, FutureGoal, RecurringIncome, RecurringExpense, Investment, FamilyMember, IncomeSource, Category, InvestmentType, Frequency } from '../types';

export const useFinanceState = (initialState: FinanceState) => {
  const [state, setState] = useState<FinanceState>(initialState);

  const updateGlobalState = useCallback((newState: Partial<FinanceState>) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  const addTransaction = useCallback((t: Transaction) => {
    setState(prev => ({ ...prev, transactions: [t, ...prev.transactions] }));
  }, []);

  const updateTransaction = useCallback((updated: Transaction) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === updated.id ? updated : t)
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  }, []);

  const addMember = useCallback((member: FamilyMember, recurringIncomes: RecurringIncome[]) => {
    setState(prev => ({
      ...prev,
      familyInfo: {
        ...prev.familyInfo!,
        members: [...prev.familyInfo!.members, member]
      },
      recurringIncomes: [...prev.recurringIncomes, ...recurringIncomes]
    }));
  }, []);

  const updateMember = useCallback((member: FamilyMember, recurringIncomes: RecurringIncome[]) => {
    setState(prev => {
      const otherMembers = prev.familyInfo!.members.filter(m => m.id !== member.id);
      const otherIncomes = prev.recurringIncomes.filter(inc => inc.memberId !== member.id);
      return {
        ...prev,
        familyInfo: {
          ...prev.familyInfo!,
          members: [...otherMembers, member]
        },
        recurringIncomes: [...otherIncomes, ...recurringIncomes]
      };
    });
  }, []);

  const removeMember = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      familyInfo: {
        ...prev.familyInfo!,
        members: prev.familyInfo!.members.filter(m => m.id !== id)
      },
      recurringIncomes: prev.recurringIncomes.filter(inc => inc.memberId !== id)
    }));
  }, []);

  const addDebt = useCallback((debt: LongTermDebt) => {
    setState(prev => ({ ...prev, debts: [...prev.debts, debt] }));
  }, []);

  const updateDebt = useCallback((debt: LongTermDebt) => {
    setState(prev => ({ ...prev, debts: prev.debts.map(d => d.id === debt.id ? debt : d) }));
  }, []);

  const removeDebt = useCallback((id: string) => {
    setState(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
  }, []);

  const addRecurringExpense = useCallback((expense: RecurringExpense) => {
    setState(prev => ({ ...prev, recurringExpenses: [...prev.recurringExpenses, expense] }));
  }, []);

  const updateRecurringExpense = useCallback((expense: RecurringExpense) => {
    setState(prev => ({ ...prev, recurringExpenses: prev.recurringExpenses.map(e => e.id === expense.id ? expense : e) }));
  }, []);

  const removeRecurringExpense = useCallback((id: string) => {
    setState(prev => ({ ...prev, recurringExpenses: prev.recurringExpenses.filter(e => e.id !== id) }));
  }, []);

  const addRecurringIncome = useCallback((income: RecurringIncome) => {
    setState(prev => ({ ...prev, recurringIncomes: [...(prev.recurringIncomes || []), income] }));
  }, []);

  const updateRecurringIncome = useCallback((income: RecurringIncome) => {
    setState(prev => ({ ...prev, recurringIncomes: (prev.recurringIncomes || []).map(i => i.id === income.id ? income : i) }));
  }, []);

  const removeRecurringIncome = useCallback((id: string) => {
    setState(prev => ({ ...prev, recurringIncomes: (prev.recurringIncomes || []).filter(i => i.id !== id) }));
  }, []);

  const addGoal = useCallback((goal: FutureGoal) => {
    setState(prev => ({ ...prev, goals: [...prev.goals, goal] }));
  }, []);

  const updateGoal = useCallback((goal: FutureGoal) => {
    setState(prev => ({ ...prev, goals: prev.goals.map(g => g.id === goal.id ? goal : g) }));
  }, []);

  const removeGoal = useCallback((id: string) => {
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  }, []);

  const addInvestment = useCallback((investment: Investment) => {
    setState(prev => ({ ...prev, investments: [...(prev.investments || []), investment] }));
  }, []);

  const updateInvestment = useCallback((investment: Investment) => {
    setState(prev => ({ ...prev, investments: (prev.investments || []).map(i => i.id === investment.id ? investment : i) }));
  }, []);

  const removeInvestment = useCallback((id: string) => {
    setState(prev => ({ ...prev, investments: (prev.investments || []).filter(inv => inv.id !== id) }));
  }, []);

  const transferToFuture = useCallback((amount: number, goalId: string) => {
    setState(prev => {
      const goal = prev.goals.find(g => g.id === goalId);
      if (!goal || amount <= 0 || goal.isAchieved) return prev;

      const transferTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'saida',
        amount,
        category: goal.category,
        description: `Reforço: ${goal.name}`,
        date: new Date().toISOString().split('T')[0]
      };

      const updatedGoals = prev.goals.map(g => {
        if (g.id === goalId) {
          const newCurrent = Number(g.currentAmount) + amount;
          return { ...g, currentAmount: newCurrent, isAchieved: newCurrent >= Number(g.targetAmount) };
        }
        return g;
      });

      return { ...prev, transactions: [transferTx, ...prev.transactions], goals: updatedGoals };
    });
  }, []);

  const removeFromFuture = useCallback((amount: number, goalId: string) => {
    setState(prev => {
      const goal = prev.goals.find(g => g.id === goalId);
      if (!goal || amount <= 0) return prev;

      const refundTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'entrada',
        amount,
        category: goal.category,
        description: `Retirada: ${goal.name}`,
        date: new Date().toISOString().split('T')[0]
      };

      return {
        ...prev,
        transactions: [refundTx, ...prev.transactions],
        goals: prev.goals.map(g => g.id === goalId ? { ...g, currentAmount: Math.max(0, Number(g.currentAmount) - amount) } : g)
      };
    });
  }, []);

  return {
    state,
    setState,
    updateGlobalState,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addMember,
    updateMember,
    removeMember,
    addDebt,
    updateDebt,
    removeDebt,
    addRecurringExpense,
    updateRecurringExpense,
    removeRecurringExpense,
    addRecurringIncome,
    updateRecurringIncome,
    removeRecurringIncome,
    addGoal,
    updateGoal,
    removeGoal,
    addInvestment,
    updateInvestment,
    removeInvestment,
    transferToFuture,
    removeFromFuture,
  };
};
