
import { useState, useCallback } from 'react';
import { FinanceState, Transaction, LongTermDebt, FutureGoal, RecurringIncome, RecurringExpense, Investment, FamilyMember, IncomeSource, Category, InvestmentType, Frequency } from '../types';
import { supabaseService } from '../services/supabaseService';

export const useFinanceState = (initialState: FinanceState) => {
  const [state, setState] = useState<FinanceState>(initialState);

  const updateGlobalState = useCallback(async (newState: Partial<FinanceState>) => {
    setState(prev => ({ ...prev, ...newState }));

    // Persistência no Supabase
    if (newState.appSettings) await supabaseService.updateAppSettings(newState.appSettings);
    if (newState.alertSettings) await supabaseService.updateAlertSettings(newState.alertSettings);
    if (newState.familyInfo?.familyName !== undefined) await supabaseService.updateProfile(newState.familyInfo.familyName);
  }, []);

  const addTransaction = useCallback(async (t: Transaction) => {
    const { id, ...txData } = t;
    const result = await supabaseService.addTransaction(txData);
    if (result) {
      setState(prev => ({ ...prev, transactions: [result, ...prev.transactions] }));
    }
  }, []);

  const updateTransaction = useCallback(async (updated: Transaction) => {
    const result = await supabaseService.updateTransaction(updated);
    if (result) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === updated.id ? result : t)
      }));
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await supabaseService.deleteTransaction(id);
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  }, []);

  const addMember = useCallback(async (member: FamilyMember, recurringIncomes: RecurringIncome[]) => {
    const { id, ...memberData } = member;
    const newMember = await supabaseService.addMember(memberData);

    if (newMember) {
      // Adicionar rendimentos recorrentes se existirem
      const savedIncomes: RecurringIncome[] = [];
      for (const inc of recurringIncomes) {
        const { id: _, ...incData } = inc;
        const savedInc = await supabaseService.addRecurringIncome({ ...incData, memberId: newMember.id });
        if (savedInc) savedIncomes.push(savedInc);
      }

      setState(prev => ({
        ...prev,
        familyInfo: {
          ...prev.familyInfo!,
          members: [...prev.familyInfo!.members, newMember]
        },
        recurringIncomes: [...prev.recurringIncomes, ...savedIncomes]
      }));
    }
  }, []);

  const updateMember = useCallback(async (member: FamilyMember, recurringIncomes: RecurringIncome[]) => {
    const result = await supabaseService.updateMember(member);
    if (result) {
      // Para rendimentos, simplificamos: removemos os antigos e adicionamos os novos
      // Ou poderíamos ter uma lógica de update, mas aqui seguimos o padrão da UI
      await supabaseService.deleteRecurringIncomeByMember(member.id);
      const savedIncomes: RecurringIncome[] = [];
      for (const inc of recurringIncomes) {
        const { id: _, ...incData } = inc;
        const savedInc = await supabaseService.addRecurringIncome({ ...incData, memberId: member.id });
        if (savedInc) savedIncomes.push(savedInc);
      }

      setState(prev => {
        const otherMembers = prev.familyInfo!.members.filter(m => m.id !== member.id);
        const otherIncomes = prev.recurringIncomes.filter(inc => inc.memberId !== member.id);
        return {
          ...prev,
          familyInfo: {
            ...prev.familyInfo!,
            members: [...otherMembers, result]
          },
          recurringIncomes: [...otherIncomes, ...savedIncomes]
        };
      });
    }
  }, []);

  const removeMember = useCallback(async (id: string) => {
    await supabaseService.deleteMember(id);
    setState(prev => ({
      ...prev,
      familyInfo: {
        ...prev.familyInfo!,
        members: prev.familyInfo!.members.filter(m => m.id !== id)
      },
      recurringIncomes: prev.recurringIncomes.filter(inc => inc.memberId !== id)
    }));
  }, []);

  const addDebt = useCallback(async (debt: LongTermDebt) => {
    const { id, ...debtData } = debt;
    const result = await supabaseService.addDebt(debtData);
    if (result) {
      setState(prev => ({ ...prev, debts: [...prev.debts, result] }));
    }
  }, []);

  const updateDebt = useCallback(async (debt: LongTermDebt) => {
    const result = await supabaseService.updateDebt(debt);
    if (result) {
      setState(prev => ({ ...prev, debts: prev.debts.map(d => d.id === debt.id ? result : d) }));
    }
  }, []);

  const removeDebt = useCallback(async (id: string) => {
    await supabaseService.deleteDebt(id);
    setState(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
  }, []);

  const addRecurringExpense = useCallback(async (expense: RecurringExpense) => {
    const { id, ...data } = expense;
    const result = await supabaseService.addRecurringExpense(data);
    if (result) {
      setState(prev => ({ ...prev, recurringExpenses: [...prev.recurringExpenses, result] }));
    }
  }, []);

  const updateRecurringExpense = useCallback(async (expense: RecurringExpense) => {
    const result = await supabaseService.updateRecurringExpense(expense);
    if (result) {
      setState(prev => ({ ...prev, recurringExpenses: prev.recurringExpenses.map(e => e.id === expense.id ? result : e) }));
    }
  }, []);

  const removeRecurringExpense = useCallback(async (id: string) => {
    await supabaseService.deleteRecurringExpense(id);
    setState(prev => ({ ...prev, recurringExpenses: prev.recurringExpenses.filter(e => e.id !== id) }));
  }, []);

  const addRecurringIncome = useCallback(async (income: RecurringIncome) => {
    const { id, ...data } = income;
    const result = await supabaseService.addRecurringIncome(data);
    if (result) {
      setState(prev => ({ ...prev, recurringIncomes: [...(prev.recurringIncomes || []), result] }));
    }
  }, []);

  const updateRecurringIncome = useCallback(async (income: RecurringIncome) => {
    const result = await supabaseService.updateRecurringIncome(income);
    if (result) {
      setState(prev => ({ ...prev, recurringIncomes: (prev.recurringIncomes || []).map(i => i.id === income.id ? result : i) }));
    }
  }, []);

  const removeRecurringIncome = useCallback(async (id: string) => {
    await supabaseService.deleteRecurringIncome(id);
    setState(prev => ({ ...prev, recurringIncomes: (prev.recurringIncomes || []).filter(i => i.id !== id) }));
  }, []);

  const addGoal = useCallback(async (goal: FutureGoal) => {
    const { id, ...data } = goal;
    const result = await supabaseService.addGoal(data);
    if (result) {
      setState(prev => ({ ...prev, goals: [...prev.goals, result] }));
    }
  }, []);

  const updateGoal = useCallback(async (goal: FutureGoal) => {
    const result = await supabaseService.updateGoal(goal);
    if (result) {
      setState(prev => ({ ...prev, goals: prev.goals.map(g => g.id === goal.id ? result : g) }));
    }
  }, []);

  const removeGoal = useCallback(async (id: string) => {
    await supabaseService.deleteGoal(id);
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  }, []);

  const addInvestment = useCallback(async (investment: Investment) => {
    const { id, ...data } = investment;
    const result = await supabaseService.addInvestment(data);
    if (result) {
      setState(prev => ({ ...prev, investments: [...(prev.investments || []), result] }));
    }
  }, []);

  const updateInvestment = useCallback(async (investment: Investment) => {
    const result = await supabaseService.updateInvestment(investment);
    if (result) {
      setState(prev => ({ ...prev, investments: (prev.investments || []).map(i => i.id === investment.id ? result : i) }));
    }
  }, []);

  const removeInvestment = useCallback(async (id: string) => {
    await supabaseService.deleteInvestment(id);
    setState(prev => ({ ...prev, investments: (prev.investments || []).filter(inv => inv.id !== id) }));
  }, []);

  const transferToFuture = useCallback(async (amount: number, goalId: string) => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal || amount <= 0 || goal.isAchieved) return;

    const transferTx: Omit<Transaction, 'id'> = {
      type: 'saida',
      amount,
      category: goal.category,
      description: `Reforço: ${goal.name}`,
      date: new Date().toISOString().split('T')[0]
    };

    const savedTx = await supabaseService.addTransaction(transferTx);
    const newCurrent = Number(goal.currentAmount) + amount;
    const updatedGoal = { ...goal, currentAmount: newCurrent, isAchieved: newCurrent >= Number(goal.targetAmount) };
    const savedGoal = await supabaseService.updateGoal(updatedGoal);

    if (savedTx && savedGoal) {
      setState(prev => ({
        ...prev,
        transactions: [savedTx, ...prev.transactions],
        goals: prev.goals.map(g => g.id === goalId ? savedGoal : g)
      }));
    }
  }, [state.goals]);

  const removeFromFuture = useCallback(async (amount: number, goalId: string) => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal || amount <= 0) return;

    const refundTx: Omit<Transaction, 'id'> = {
      type: 'entrada',
      amount,
      category: goal.category,
      description: `Retirada: ${goal.name}`,
      date: new Date().toISOString().split('T')[0]
    };

    const savedTx = await supabaseService.addTransaction(refundTx);
    const updatedGoal = { ...goal, currentAmount: Math.max(0, Number(goal.currentAmount) - amount) };
    const savedGoal = await supabaseService.updateGoal(updatedGoal);

    if (savedTx && savedGoal) {
      setState(prev => ({
        ...prev,
        transactions: [savedTx, ...prev.transactions],
        goals: prev.goals.map(g => g.id === goalId ? savedGoal : g)
      }));
    }
  }, [state.goals]);

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
