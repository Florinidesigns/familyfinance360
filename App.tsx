
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import SummaryCards from './components/SummaryCards';
import DashboardCharts from './components/DashboardCharts';
import TransactionForm from './components/TransactionForm';
import EditTransactionModal from './components/EditTransactionModal';
import Backoffice from './components/Backoffice';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import PricingPage from './components/PricingPage';
import CheckoutPage from './components/CheckoutPage';
import IRSIndicators from './components/IRSIndicators';
import IRSConfirmationReport from './components/IRSConfirmationReport';
import ReportsPage from './components/ReportsPage';
import SectionCard from './components/ui/SectionCard';
import { Input, Select, Button } from './components/ui/FormElements';
import ItemRow from './components/ui/ItemRow';
import { useFinanceState } from './hooks/useFinanceState';
import { Transaction, FinanceState, FamilyMember, RecurringIncome, RecurringExpense, LongTermDebt, FutureGoal, Investment, Category, InvestmentType, IncomeSource, Frequency } from './types';
import { getFinancialAdvice } from './services/geminiService';
import { apiService } from './services/apiService';
import { BrainCircuit, Loader2, ArrowRight, PlusCircle, MinusCircle, CloudCheck, Cloud, History, Target, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, Sparkles, Pencil, Trash2, PartyPopper, Settings, ShieldCheck, Plus, Check, X, Users, Briefcase, Fingerprint, CreditCard, Home, PieChart, Rocket, CalendarRange, Hash, Coins, Layers, Sliders } from 'lucide-react';
import { getCategoryIcon, CATEGORIES, INCOME_SOURCES, CURRENCY_SYMBOLS } from './constants';

const DEFAULT_STATE: FinanceState = {
  transactions: [],
  debts: [],
  goals: [],
  recurringIncomes: [],
  recurringExpenses: [],
  investments: [],
  familyInfo: { familyName: '', members: [] },
  appSettings: { currency: 'EUR', language: 'Português', theme: 'light' }
};

const MONTHS = [
  { val: 1, name: 'Jan' }, { val: 2, name: 'Fev' }, { val: 3, name: 'Mar' },
  { val: 4, name: 'Abr' }, { val: 5, name: 'Mai' }, { val: 6, name: 'Jun' },
  { val: 7, name: 'Jul' }, { val: 8, name: 'Ago' }, { val: 9, name: 'Set' },
  { val: 10, name: 'Out' }, { val: 11, name: 'Nov' }, { val: 12, name: 'Dez' }
];

const FULL_MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

type ViewState = 'landing' | 'pricing' | 'checkout' | 'login' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backofficeSubTab, setBackofficeSubTab] = useState<'present' | 'past' | 'goals'>('present');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [reinforcingGoalId, setReinforcingGoalId] = useState<string | null>(null);
  const [removingGoalId, setRemovingGoalId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [editContext, setEditContext] = useState<{ id: string, type: 'debt' | 'goal' | 'investment' | 'income' | 'expense' } | null>(null);

  const {
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
  } = useFinanceState(DEFAULT_STATE);

  // --- Estados do Onboarding (Campos Temporários) ---
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Pai/Mãe');
  const [newMemberBirthDate, setNewMemberBirthDate] = useState('');
  const [newMemberNif, setNewMemberNif] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const [tempMemberIncomes, setTempMemberIncomes] = useState<{ name: string, amount: string, source: IncomeSource }[]>([]);
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeSource, setNewIncomeSource] = useState<IncomeSource>('Ordenado');

  const [tempDebtName, setTempDebtName] = useState('');
  const [tempDebtType, setTempDebtType] = useState('Hipoteca');
  const [tempDebtCalcType, setTempDebtCalcType] = useState<'installments' | 'endDate'>('installments');
  const [tempDebtContracted, setTempDebtContracted] = useState('');
  const [tempDebtMonthly, setTempDebtMonthly] = useState('');
  const [tempDebtInstallments, setTempDebtInstallments] = useState('');
  const [tempDebtEndDate, setTempDebtEndDate] = useState('');
  const [tempDebtDay, setTempDebtDay] = useState('1');
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);

  const [tempRecName, setTempRecName] = useState('');
  const [tempRecAmount, setTempRecAmount] = useState('');
  const [tempRecFreq, setTempRecFreq] = useState<Frequency>('Mensal');
  const [tempRecCat, setTempRecCat] = useState<Category>('Despesas');
  const [tempRecDay, setTempRecDay] = useState('1');
  const [tempRecMonth, setTempRecMonth] = useState(new Date().getMonth() + 1);
  const [tempRecYear, setTempRecYear] = useState(CURRENT_YEAR);
  const [editingRecExpenseId, setEditingRecExpenseId] = useState<string | null>(null);

  const [tempGoalName, setTempGoalName] = useState('');
  const [tempGoalAmount, setTempGoalAmount] = useState('');
  const [tempGoalCurrent, setTempGoalCurrent] = useState('');
  const [tempGoalCategory, setTempGoalCategory] = useState<Category>('Lazer');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const [tempInvName, setTempInvName] = useState('');
  const [tempInvAmount, setTempInvAmount] = useState('');
  const [tempInvType, setTempInvType] = useState<InvestmentType>('PPR');
  const [tempInvDay, setTempInvDay] = useState('1');
  const [tempInvReinforcement, setTempInvReinforcement] = useState('');
  const [editingInvId, setEditingInvId] = useState<string | null>(null);

  const processRecurring = useCallback((currentState: FinanceState) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = now.getDate();

    let updated = false;
    const newTransactions = [...currentState.transactions];

    currentState.recurringExpenses.forEach(expense => {
      if (today >= expense.dayOfMonth) {
        const alreadyExists = currentState.transactions.some(t => {
          const tDate = new Date(t.date);
          return t.description === `[Fixo] ${expense.name}` &&
            tDate.getMonth() === currentMonth &&
            tDate.getFullYear() === currentYear;
        });

        if (!alreadyExists) {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(expense.dayOfMonth).padStart(2, '0')}`;
          const autoTx: Transaction = {
            id: `auto-exp-${expense.id}-${currentMonth}-${currentYear}`,
            type: 'saida',
            amount: expense.amount,
            category: expense.category,
            description: `[Fixo] ${expense.name}`,
            date: dateStr
          };
          newTransactions.unshift(autoTx);
          updated = true;
        }
      }
    });

    (currentState.recurringIncomes || []).forEach(income => {
      if (today >= income.dayOfMonth) {
        const alreadyExists = currentState.transactions.some(t => {
          const tDate = new Date(t.date);
          return t.description === `[Fixo] ${income.name}` &&
            tDate.getMonth() === currentMonth &&
            tDate.getFullYear() === currentYear;
        });

        if (!alreadyExists) {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(income.dayOfMonth).padStart(2, '0')}`;
          const autoTx: Transaction = {
            id: `auto-inc-${income.id}-${currentMonth}-${currentYear}`,
            type: 'entrada',
            amount: income.amount,
            category: income.source,
            description: `[Fixo] ${income.name}`,
            date: dateStr
          };
          newTransactions.unshift(autoTx);
          updated = true;
        }
      }
    });

    (currentState.debts || []).forEach(debt => {
      if (debt.dayOfMonth && today >= debt.dayOfMonth) {
        const alreadyExists = currentState.transactions.some(t => {
          const tDate = new Date(t.date);
          return t.description === `[Crédito] ${debt.name}` &&
            tDate.getMonth() === currentMonth &&
            tDate.getFullYear() === currentYear;
        });

        if (!alreadyExists) {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(debt.dayOfMonth).padStart(2, '0')}`;
          const autoTx: Transaction = {
            id: `auto-debt-${debt.id}-${currentMonth}-${currentYear}`,
            type: 'saida',
            amount: debt.monthlyPayment,
            category: (debt.type === 'Carro' ? 'Transporte' : 'Habitação') as Category,
            description: `[Crédito] ${debt.name}`,
            date: dateStr
          };
          newTransactions.unshift(autoTx);
          updated = true;
        }
      }
    });

    (currentState.investments || []).forEach(inv => {
      if (inv.type === 'PPR' && inv.dayOfMonth && inv.monthlyReinforcement && today >= inv.dayOfMonth) {
        const alreadyExists = currentState.transactions.some(t => {
          const tDate = new Date(t.date);
          return t.description === `[Reforço] ${inv.name}` &&
            tDate.getMonth() === currentMonth &&
            tDate.getFullYear() === currentYear;
        });

        if (!alreadyExists) {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(inv.dayOfMonth).padStart(2, '0')}`;
          const autoTx: Transaction = {
            id: `auto-inv-${inv.id}-${currentMonth}-${currentYear}`,
            type: 'saida',
            amount: inv.monthlyReinforcement,
            category: 'Investimento' as any,
            description: `[Reforço] ${inv.name}`,
            date: dateStr
          };
          newTransactions.unshift(autoTx);
          updated = true;
        }
      }
    });

    if (updated) {
      setState(prev => ({ ...prev, transactions: newTransactions }));
    }
  }, [setState]);

  useEffect(() => {
    const init = async () => {
      const isAuthenticated = apiService.checkAuth();
      if (isAuthenticated) {
        setView('dashboard');
        const savedData = await apiService.loadFinanceData();
        if (savedData) {
          const validatedData = {
            ...savedData,
            familyInfo: savedData.familyInfo || { familyName: '', members: [] },
            recurringIncomes: savedData.recurringIncomes || [],
            recurringExpenses: savedData.recurringExpenses || [],
            debts: (savedData.debts || []).map((d: any) => ({
              ...d,
              contractedValue: d.contractedValue || 0,
              monthlyPayment: d.monthlyPayment || 0,
              remainingValue: d.remainingValue || 0,
              totalValue: d.totalValue || 0
            }))
          };
          setState(validatedData);
          processRecurring(validatedData);
        } else {
          processRecurring(DEFAULT_STATE);
        }
      }
      setIsInitialLoading(false);
    };
    init();
  }, [processRecurring, setState]);

  useEffect(() => {
    if (isInitialLoading || view !== 'dashboard') return;
    const syncData = async () => {
      setIsSyncing(true);
      await apiService.saveFinanceData(state);
      setIsSyncing(false);
    };
    const timer = setTimeout(syncData, 500);
    return () => clearTimeout(timer);
  }, [state, isInitialLoading, view]);

  const handleLogin = async (email: string) => {
    await apiService.login(email);
    setView('dashboard');
    const savedData = await apiService.loadFinanceData();
    if (savedData) {
      setState(savedData);
      processRecurring(savedData);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const addIncomeToTempMember = () => {
    if (!newIncomeName || !newIncomeAmount) return;
    setTempMemberIncomes([...tempMemberIncomes, { name: newIncomeName, amount: newIncomeAmount, source: newIncomeSource }]);
    setNewIncomeName(''); setNewIncomeAmount('');
  };

  const addMemberAction = () => {
    if (!newMemberName.trim() || !newMemberBirthDate) return;
    const memberId = editingMemberId || Math.random().toString(36).substr(2, 9);
    const totalSalary = tempMemberIncomes.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const member: FamilyMember = {
      id: memberId, name: newMemberName, role: newMemberRole, age: calculateAge(newMemberBirthDate), birthDate: newMemberBirthDate, nif: newMemberNif || undefined, isEmployed: tempMemberIncomes.length > 0, salary: totalSalary > 0 ? totalSalary : undefined
    };

    const newIncomesList: RecurringIncome[] = tempMemberIncomes.map((inc, index) => ({
      id: `salary-${memberId}-${index}`, name: `${inc.name} (${member.name})`, amount: Number(inc.amount), source: inc.source, memberId: member.id, dayOfMonth: 1
    }));

    if (editingMemberId) {
      updateMember(member, newIncomesList);
    } else {
      addMember(member, newIncomesList);
    }

    setNewMemberName(''); setNewMemberBirthDate(''); setNewMemberNif(''); setNewMemberRole('Pai/Mãe'); setTempMemberIncomes([]); setEditingMemberId(null);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMemberId(member.id);
    setNewMemberName(member.name);
    setNewMemberRole(member.role);
    setNewMemberBirthDate(member.birthDate || '');
    setNewMemberNif(member.nif || '');
    const memberIncomes = (state.recurringIncomes || []).filter((inc: RecurringIncome) => inc.memberId === member.id);
    setTempMemberIncomes(memberIncomes.map((inc: RecurringIncome) => ({ name: inc.name.split(' (')[0], amount: String(inc.amount), source: inc.source })));
  };

  const handleEditDebt = (debt: LongTermDebt) => {
    setEditingDebtId(debt.id);
    setTempDebtName(debt.name);
    setTempDebtType(debt.type);
    setTempDebtContracted(String(debt.contractedValue));
    setTempDebtMonthly(String(debt.monthlyPayment));
    setTempDebtDay(String(debt.dayOfMonth || 1));
    setTempDebtCalcType(debt.calculationType);
    if (debt.calculationType === 'installments') {
      setTempDebtInstallments(String(debt.remainingInstallments || 0));
    } else {
      setTempDebtEndDate(debt.endDate || '');
    }
  };

  const handleEditRecExpense = (expense: RecurringExpense) => {
    setEditingRecExpenseId(expense.id);
    setTempRecName(expense.name);
    setTempRecAmount(String(expense.amount));
    setTempRecCat(expense.category);
    setTempRecFreq(expense.frequency);
    setTempRecDay(String(expense.dayOfMonth));
  };

  const handleEditGoal = (goal: FutureGoal) => {
    setEditingGoalId(goal.id);
    setTempGoalName(goal.name);
    setTempGoalAmount(String(goal.targetAmount));
    setTempGoalCategory(goal.category);
  };

  const handleEditInvestment = (inv: Investment) => {
    setEditingInvId(inv.id);
    setTempInvName(inv.name);
    setTempInvAmount(String(inv.amount));
    setTempInvType(inv.type);
    setTempInvDay(String(inv.dayOfMonth || 1));
    setTempInvReinforcement(String(inv.monthlyReinforcement || ''));
  };

  const addDebtAction = () => {
    if (!tempDebtName || !tempDebtMonthly) return;
    let installmentsInTotal = 0;
    let remainingVal = 0;
    const debtId = editingDebtId || Math.random().toString(36).substr(2, 9);

    if (tempDebtCalcType === 'installments') {
      installmentsInTotal = Number(tempDebtInstallments || 0);
      remainingVal = installmentsInTotal * Number(tempDebtMonthly);
    } else if (tempDebtEndDate) {
      const end = new Date(tempDebtEndDate);
      const start = new Date();
      installmentsInTotal = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      remainingVal = Math.max(0, installmentsInTotal) * Number(tempDebtMonthly);
    }

    const debt: LongTermDebt = {
      id: debtId,
      name: tempDebtName,
      type: tempDebtType as any,
      contractedValue: Number(tempDebtContracted || 0),
      monthlyPayment: Number(tempDebtMonthly),
      calculationType: tempDebtCalcType,
      remainingInstallments: tempDebtCalcType === 'installments' ? installmentsInTotal : undefined,
      endDate: tempDebtCalcType === 'endDate' ? tempDebtEndDate : undefined,
      totalValue: Number(tempDebtContracted || 0),
      remainingValue: remainingVal,
      dayOfMonth: Number(tempDebtDay)
    };

    if (editingDebtId) {
      updateDebt(debt);
    } else {
      addDebt(debt);
    }

    setTempDebtName(''); setTempDebtMonthly(''); setTempDebtContracted(''); setTempDebtInstallments(''); setTempDebtEndDate(''); setTempDebtDay('1'); setEditingDebtId(null);
  };

  const addRecurringAction = () => {
    if (!tempRecName || !tempRecAmount) return;
    const expenseId = editingRecExpenseId || Math.random().toString(36).substr(2, 9);
    const expense: RecurringExpense = {
      id: expenseId, name: tempRecName, amount: Number(tempRecAmount), frequency: tempRecFreq, category: tempRecCat, dayOfMonth: Number(tempRecDay), month: tempRecFreq !== 'Mensal' ? tempRecMonth : (new Date().getMonth() + 1), year: tempRecFreq !== 'Mensal' ? tempRecYear : CURRENT_YEAR
    };
    if (editingRecExpenseId) {
      updateRecurringExpense(expense);
    } else {
      addRecurringExpense(expense);
    }
    setTempRecName(''); setTempRecAmount(''); setEditingRecExpenseId(null);
  };

  const addGoalAction = () => {
    if (!tempGoalName || !tempGoalAmount) return;
    const goalId = editingGoalId || Math.random().toString(36).substr(2, 9);
    const goal: FutureGoal = {
      id: goalId, name: tempGoalName, targetAmount: Number(tempGoalAmount), currentAmount: Number(tempGoalCurrent || 0), category: tempGoalCategory
    };
    if (editingGoalId) {
      updateGoal(goal);
    } else {
      addGoal(goal);
    }
    setTempGoalName(''); setTempGoalAmount(''); setTempGoalCurrent(''); setEditingGoalId(null);
  };

  const addInvAction = () => {
    if (!tempInvName || !tempInvAmount) return;
    const invId = editingInvId || Math.random().toString(36).substr(2, 9);
    const investment: Investment = {
      id: invId,
      name: tempInvName,
      amount: Number(tempInvAmount),
      type: tempInvType,
      dayOfMonth: tempInvType === 'PPR' ? Number(tempInvDay) : undefined,
      monthlyReinforcement: tempInvType === 'PPR' ? Number(tempInvReinforcement) : undefined
    };
    if (editingInvId) {
      updateInvestment(investment);
    } else {
      addInvestment(investment);
    }
    setTempInvName(''); setTempInvAmount(''); setTempInvDay('1'); setTempInvReinforcement(''); setEditingInvId(null);
  };

  const handleGetAdvice = async () => {
    if (showAdvice) { setShowAdvice(false); return; }
    if (advice) { setShowAdvice(true); return; }
    setLoadingAdvice(true);
    const result = await getFinancialAdvice(state);
    setAdvice(result);
    setLoadingAdvice(false);
    setShowAdvice(true);
  };

  const getTransactionColor = (tx: Transaction) => {
    if (tx.type === 'entrada') return 'text-emerald-600';
    if (tx.description.startsWith('Reforço:') || tx.description.startsWith('Liquidação:')) return 'text-blue-600';
    return 'text-rose-600';
  };

  const currencySymbol = CURRENCY_SYMBOLS[state.appSettings?.currency || 'EUR'];

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Limpando a mesa para si...</p>
      </div>
    );
  }

  if (view === 'landing') return <LandingPage onStart={() => setView('pricing')} onLogin={() => setView('login')} />;
  if (view === 'pricing') return <PricingPage onSelectPlan={(plan) => { setSelectedPlan(plan); setView('checkout'); }} onBack={() => setView('landing')} currencySymbol={currencySymbol} />;
  if (view === 'checkout') return <CheckoutPage plan={selectedPlan!} onPaymentSuccess={() => setView('login')} onBack={() => setView('pricing')} currencySymbol={currencySymbol} />;
  if (view === 'login') return <LoginPage onLogin={handleLogin} onBack={() => setView('landing')} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="mb-8 px-4">
              {state.familyInfo?.familyName && (
                <p className="text-emerald-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Família {state.familyInfo.familyName}</p>
              )}
            </div>
            <SummaryCards state={state} onNavigate={setActiveTab} currencySymbol={currencySymbol} />
            <DashboardCharts transactions={state.transactions} currencySymbol={currencySymbol} />
            <SectionCard title="Atividade Recente" headerAction={<button onClick={() => setActiveTab('present')} className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">Ver todas <ArrowRight size={14} /></button>}>
              <div className="space-y-4">
                {state.transactions.length > 0 ? (
                  state.transactions.slice(0, 5).map(tx => (
                    <ItemRow key={tx.id} icon={getCategoryIcon(tx.category)} title={tx.description} subtitle={tx.category} value={`${tx.type === 'entrada' ? '+' : '-'}${tx.amount.toLocaleString('pt-PT')}${currencySymbol}`} onEdit={() => setEditingTransaction(tx)} variant={tx.type === 'entrada' ? 'emerald' : 'slate'} />
                  ))
                ) : (
                  <div className="py-10 text-center text-slate-400">
                    <History size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">Ainda não tem transações</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </>
        );
      case 'present':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <SectionCard variant="emerald" title={`Economia Familiar ${FULL_MONTHS[new Date().getMonth()]}`} icon={<Target size={150} />}>
              <div className="mt-8 flex flex-wrap gap-4 md:gap-8">
                <div className="bg-white/10 p-4 rounded-[24px] backdrop-blur-md flex items-center gap-4 flex-1 min-w-[200px]">
                  <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center"><ArrowUpRight size={24} /></div>
                  <div><p className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-white">Entradas</p><p className="text-2xl md:text-3xl font-black text-white">{state.transactions.filter(t => t.type === 'entrada').reduce((a, b) => a + Number(b.amount), 0).toLocaleString('pt-PT')}{currencySymbol}</p></div>
                </div>
                <div className="bg-white/10 p-4 rounded-[24px] backdrop-blur-md flex items-center gap-4 flex-1 min-w-[200px]">
                  <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center"><ArrowDownLeft size={24} /></div>
                  <div><p className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-white">Saídas</p><p className="text-2xl md:text-3xl font-black text-white">{state.transactions.filter(t => t.type === 'saida').reduce((a, b) => a + Number(b.amount), 0).toLocaleString('pt-PT')}{currencySymbol}</p></div>
                </div>
              </div>
            </SectionCard>
            <TransactionForm onAdd={addTransaction} currencySymbol={currencySymbol} />
            <SectionCard title="Histórico Detalhado">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50"><tr><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Descrição</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoria</th><th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Montante</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {state.transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-all group/row">
                        <td className="px-8 py-6 text-sm text-slate-500">{tx.date}</td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-800 flex items-center gap-2">{tx.description}<button onClick={() => setEditingTransaction(tx)} className="opacity-0 group-hover/row:opacity-100 p-1.5 bg-blue-600 text-white rounded-lg"><Pencil size={12} /></button></td>
                        <td className="px-8 py-6 text-sm"><span className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-bold text-[10px] uppercase">{getCategoryIcon(tx.category)} {tx.category}</span></td>
                        <td className={`px-8 py-6 text-base font-black text-right ${getTransactionColor(tx)}`}>{tx.type === 'entrada' ? '+' : '-'}{tx.amount.toLocaleString('pt-PT')}{currencySymbol}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-20">
            <SectionCard variant="slate" title="Onboarding Familiar" subtitle="Registe o seu agregado e estruture a sua vida financeira pilar a pilar." icon={<Settings size={180} />} />

            <div className="space-y-8">
              <div className="flex items-center gap-3 px-4"><Users className="text-emerald-600" size={28} /><h4 className="text-2xl font-black text-slate-800">1. Agregado Familiar</h4></div>
              <SectionCard>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="flex flex-col gap-6">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Fingerprint size={14} /> Identificação e Rendimento</p>
                      <div className="max-w-xs">
                        <Input label="Apelido / Nome de Família" placeholder="Ex: Florim" value={state.familyInfo?.familyName || ''} onChange={e => updateGlobalState({ familyInfo: { ...state.familyInfo!, familyName: e.target.value } })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Nome" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} />
                      <Select label="Papel" value={newMemberRole} onChange={e => setNewMemberRole(e.target.value)}><option>Cônjuge</option><option>Filho/a</option><option>Outro</option><option>Pai/Mãe</option></Select>
                      <Input label="Data Nascimento" type="date" value={newMemberBirthDate} onChange={e => setNewMemberBirthDate(e.target.value)} />
                      <Input label="NIF" maxLength={9} value={newMemberNif} onChange={e => setNewMemberNif(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Coins size={14} className="text-emerald-600" /> Rendimentos Mensais</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input className="bg-white border rounded-xl px-4 py-2 text-xs font-bold placeholder:text-[10px]" placeholder="Descrição" value={newIncomeName} onChange={e => setNewIncomeName(e.target.value)} />
                        <input type="number" className="bg-white border rounded-xl px-4 py-2 text-xs font-bold placeholder:text-[10px]" placeholder={`Valor ${currencySymbol}`} value={newIncomeAmount} onChange={e => setNewIncomeAmount(e.target.value)} />
                        <select className="bg-white border rounded-xl px-4 py-2 text-[10px] font-black uppercase" value={newIncomeSource} onChange={e => setNewIncomeSource(e.target.value as any)}>{INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      </div>
                      <Button variant="ghost-emerald" fullWidth onClick={addIncomeToTempMember} icon={<Plus size={14} />}>Adicionar Rendimento</Button>
                      <div className="flex flex-wrap gap-2">{tempMemberIncomes.map((inc, i) => (<div key={i} className="bg-white px-3 py-1.5 rounded-lg border flex items-center gap-2 shadow-sm"><span className="text-[10px] font-black text-slate-700">{inc.name}: {Number(inc.amount).toLocaleString()}{currencySymbol}</span><button onClick={() => setTempMemberIncomes(tempMemberIncomes.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-600"><X size={12} /></button></div>))}</div>
                    </div>
                    <Button fullWidth onClick={addMemberAction} icon={editingMemberId ? <Check size={18} /> : <ArrowRight size={18} />}>
                      {editingMemberId ? 'Atualizar Membro' : 'Registar no Agregado'}
                    </Button>
                    {editingMemberId && (
                      <Button fullWidth variant="ghost-slate" onClick={() => { setEditingMemberId(null); setNewMemberName(''); setNewMemberBirthDate(''); setNewMemberNif(''); setNewMemberRole('Pai/Mãe'); setTempMemberIncomes([]); }}>Cancelar Edição</Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
                    {state.familyInfo?.members.map(m => (
                      <ItemRow key={m.id} title={m.name} subtitle={`${m.role} • ${m.age} anos`} value={m.salary ? `${m.salary.toLocaleString('pt-PT')}${currencySymbol}` : undefined} valueInside={true} onEdit={() => handleEditMember(m)} onDelete={() => removeMember(m.id)} variant="blue" />
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3 px-4"><Rocket className="text-orange-600" size={28} /><h4 className="text-2xl font-black text-slate-800">2. Estratégia Financeira</h4></div>
              <SectionCard title="Créditos e Financiamentos" icon={<CreditCard className="text-orange-600" size={20} />}>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 w-fit mb-6">
                  <button onClick={() => setTempDebtCalcType('installments')} className={`px-4 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all ${tempDebtCalcType === 'installments' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>Prestações</button>
                  <button onClick={() => setTempDebtCalcType('endDate')} className={`px-4 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all ${tempDebtCalcType === 'endDate' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>Data Fim</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-7 items-end gap-3">
                  <Input label="Descrição" placeholder="Descrição" value={tempDebtName} onChange={e => setTempDebtName(e.target.value)} />
                  <Select label="Tipo" value={tempDebtType} onChange={e => setTempDebtType(e.target.value)}><option>Carro</option><option>Empréstimo</option><option>Hipoteca</option><option>Outros</option></Select>
                  <Input label="Cap. Contratado" type="number" placeholder={`Capital ${currencySymbol}`} value={tempDebtContracted} onChange={e => setTempDebtContracted(e.target.value)} />
                  <Input label={`Valor ${currencySymbol}`} type="number" variant="orange" placeholder={`Mensalidade ${currencySymbol}`} value={tempDebtMonthly} onChange={e => setTempDebtMonthly(e.target.value)} />
                  <Input label="Dia Liq." type="number" min="1" max="31" placeholder="Dia Liq." value={tempDebtDay} onChange={e => setTempDebtDay(e.target.value)} />
                  {tempDebtCalcType === 'installments' ? <Input label="Nr. Prest." type="number" placeholder="Prestações" value={tempDebtInstallments} onChange={e => setTempDebtInstallments(e.target.value)} /> : <Input label="Data Fim" type="date" value={tempDebtEndDate} onChange={e => setTempDebtEndDate(e.target.value)} />}
                  <div className="flex flex-col gap-2">
                    <Button variant="orange" onClick={addDebtAction} icon={editingDebtId ? <Check size={16} /> : <Plus size={16} />}>{editingDebtId ? 'Atualizar' : 'Adicionar'}</Button>
                    {editingDebtId && <Button variant="ghost-slate" onClick={() => { setEditingDebtId(null); setTempDebtName(''); setTempDebtMonthly(''); setTempDebtContracted(''); setTempDebtInstallments(''); setTempDebtEndDate(''); setTempDebtDay('1'); }}>Cancelar</Button>}
                  </div>
                </div>

                {/* Integrated List */}
                {state.debts.length > 0 && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-slate-50">
                    {state.debts.map(debt => (
                      <ItemRow key={debt.id} variant="orange" title={debt.name} subtitle={`${debt.type} • Dia ${debt.dayOfMonth}`} value={`${debt.monthlyPayment.toLocaleString('pt-PT')}${currencySymbol}`} onEdit={() => handleEditDebt(debt)} onDelete={() => removeDebt(debt.id)} />
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Compromissos Fixos" icon={<Layers className="text-orange-600" size={20} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
                  <Select label="Frequência" value={tempRecFreq} onChange={e => setTempRecFreq(e.target.value as Frequency)}><option value="Anual">Anual</option><option value="Mensal">Mensal</option><option value="Semestral">Semestral</option><option value="Trimestral">Trimestral</option></Select>
                  <Input label="Descrição" placeholder="Descrição" value={tempRecName} onChange={e => setTempRecName(e.target.value)} />
                  <Input label="Dia Liq." type="number" value={tempRecDay} onChange={e => setTempRecDay(e.target.value)} />
                  <Select label="Mês" className={tempRecFreq === 'Mensal' ? 'opacity-30' : ''} value={tempRecMonth} onChange={e => setTempRecMonth(Number(e.target.value))} disabled={tempRecFreq === 'Mensal'}>{MONTHS.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}</Select>
                  <Select label="Ano" className={tempRecFreq === 'Mensal' ? 'opacity-30' : ''} value={tempRecYear} onChange={e => setTempRecYear(Number(e.target.value))} disabled={tempRecFreq === 'Mensal'}>{YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}</Select>
                  <Input label={`Valor ${currencySymbol}`} type="number" value={tempRecAmount} onChange={e => setTempRecAmount(e.target.value)} />
                  <div className="flex flex-col gap-2 self-end">
                    <Button variant="orange" onClick={addRecurringAction} icon={editingRecExpenseId ? <Check size={16} /> : <Plus size={16} />}>{editingRecExpenseId ? 'Atualizar' : 'Adicionar'}</Button>
                    {editingRecExpenseId && <Button variant="ghost-slate" onClick={() => { setEditingRecExpenseId(null); setTempRecName(''); setTempRecAmount(''); }}>Cancelar</Button>}
                  </div>
                </div>

                {/* Integrated List */}
                {state.recurringExpenses.length > 0 && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-slate-50">
                    {state.recurringExpenses.map(exp => (
                      <ItemRow key={exp.id} variant="orange" title={exp.name} subtitle={`${exp.frequency} • Dia ${exp.dayOfMonth}`} value={`${exp.amount.toLocaleString('pt-PT')}${currencySymbol}`} onEdit={() => handleEditRecExpense(exp)} onDelete={() => removeRecurringExpense(exp.id)} />
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Sonhos e Objetivos" icon={<Sparkles className="text-blue-600" size={20} />}>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                  <Input placeholder="Objetivo" value={tempGoalName} onChange={e => setTempGoalName(e.target.value)} />
                  <Input type="number" placeholder={`Alvo ${currencySymbol}`} value={tempGoalAmount} onChange={e => setTempGoalAmount(e.target.value)} />
                  <Input type="number" variant="blue" placeholder={`Já tem ${currencySymbol}`} value={tempGoalCurrent} onChange={e => setTempGoalCurrent(e.target.value)} />
                  <Select value={tempGoalCategory} onChange={e => setTempGoalCategory(e.target.value as Category)}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</Select>
                  <div className="flex flex-col gap-2">
                    <Button variant="blue" onClick={addGoalAction} icon={editingGoalId ? <Check size={16} /> : <Plus size={16} />}>{editingGoalId ? 'Atualizar' : 'Adicionar'}</Button>
                    {editingGoalId && <Button variant="ghost-slate" onClick={() => { setEditingGoalId(null); setTempGoalName(''); setTempGoalAmount(''); setTempGoalCurrent(''); }}>Cancelar</Button>}
                  </div>
                </div>

                {/* Integrated List */}
                {state.goals.length > 0 && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-slate-50">
                    {state.goals.map(goal => (
                      <ItemRow key={goal.id} variant="blue" title={goal.name} subtitle={`${goal.category}`} value={`${goal.targetAmount.toLocaleString('pt-PT')}${currencySymbol}`} onEdit={() => handleEditGoal(goal)} onDelete={() => removeGoal(goal.id)} />
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard variant="slate" title="Investimentos Familiares" icon={<PieChart className="text-emerald-500" size={20} />}>
                <div className={`grid grid-cols-1 ${tempInvType === 'PPR' ? 'lg:grid-cols-6' : 'lg:grid-cols-4'} gap-4 items-end mb-8`}>
                  <Input variant="slate-emerald" placeholder="Identificação" value={tempInvName} onChange={e => setTempInvName(e.target.value)} />
                  <Input variant="slate-emerald" type="number" placeholder={`Total ${currencySymbol}`} value={tempInvAmount} onChange={e => setTempInvAmount(e.target.value)} />
                  <Select variant="slate-emerald" value={tempInvType} onChange={e => setTempInvType(e.target.value as InvestmentType)}><option value="Acções">Acções</option><option value="Certificados de Aforro">Aforro</option><option value="Cryptomoeda">Crypto</option><option value="PPR">PPR</option></Select>
                  {tempInvType === 'PPR' && (
                    <>
                      <Input variant="slate-emerald" type="number" placeholder={`Reforço ${currencySymbol}`} value={tempInvReinforcement} onChange={e => setTempInvReinforcement(e.target.value)} />
                      <Input variant="slate-emerald" type="number" min="1" max="31" placeholder="Dia" value={tempInvDay} onChange={e => setTempInvDay(e.target.value)} />
                    </>
                  )}
                  <div className="flex flex-col gap-2">
                    <Button variant="emerald" noShadow onClick={addInvAction} icon={editingInvId ? <Check size={16} /> : <Plus size={16} />}>{editingInvId ? 'Atualizar' : 'Adicionar'}</Button>
                    {editingInvId && <Button variant="ghost-slate" onClick={() => { setEditingInvId(null); setTempInvName(''); setTempInvAmount(''); setTempInvDay('1'); setTempInvReinforcement(''); }}>Cancelar</Button>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.investments.map(inv => (
                    <ItemRow key={inv.id} variant="emerald" title={inv.name} subtitle={inv.type === 'PPR' ? `${inv.type} • Reforço: ${inv.monthlyReinforcement}${currencySymbol} (Dia ${inv.dayOfMonth})` : inv.type} value={`${inv.amount.toLocaleString('pt-PT')}${currencySymbol}`} onEdit={() => handleEditInvestment(inv)} onDelete={() => removeInvestment(inv.id)} />
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3 px-4"><Settings className="text-slate-600" size={28} /><h4 className="text-2xl font-black text-slate-800">3. Configurações da Aplicação</h4></div>
              <SectionCard title="Preferências do Sistema" icon={<Sliders size={20} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Select
                    label="Moeda Principal"
                    value={state.appSettings?.currency || 'EUR'}
                    onChange={e => updateGlobalState({ appSettings: { ...state.appSettings!, currency: e.target.value } })}
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dólar ($)</option>
                    <option value="GBP">Libra (£)</option>
                    <option value="BRL">Real (R$)</option>
                  </Select>
                  <Select
                    label="Idioma"
                    value={state.appSettings?.language || 'Português'}
                    onChange={e => updateGlobalState({ appSettings: { ...state.appSettings!, language: e.target.value } })}
                  >
                    <option>Português</option>
                    <option>English</option>
                    <option>Español</option>
                  </Select>
                  <Select
                    label="Tema Visual"
                    value={state.appSettings?.theme || 'light'}
                    onChange={e => updateGlobalState({ appSettings: { ...state.appSettings!, theme: e.target.value as any } })}
                  >
                    <option value="light">Modo Claro</option>
                    <option value="dark">Modo Escuro</option>
                  </Select>
                </div>
              </SectionCard>
            </div>

            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex items-center gap-6"><div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-sm"><ShieldCheck size={32} /></div><div><h5 className="font-black text-slate-800">Pronto para começar?</h5><p className="text-slate-400 text-sm">Os seus dados estão seguros e organizados.</p></div></div>
              <div className="flex flex-col md:flex-row gap-4">
                <Button variant="ghost-slate" icon={<Trash2 size={16} />} onClick={() => { if (confirm('Tem a certeza que deseja apagar todos os dados?')) apiService.clearDatabase(); }}>Limpar Tudo</Button>
                <Button onClick={() => { processRecurring(state); setActiveTab('dashboard'); }}>ATUALIZAR APLICAÇÃO</Button>
              </div>
            </div>
          </div>
        );
      case 'past':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <SectionCard variant="orange" title="Compromissos do Passado" icon={<History size={150} />}>
              <div className="mt-8 flex flex-wrap gap-4 md:gap-8">
                <div className="bg-white/10 p-4 rounded-[24px] backdrop-blur-md flex items-center gap-4 flex-1 min-w-[200px]">
                  <div className="w-12 h-12 bg-white text-orange-600 rounded-2xl flex items-center justify-center"><CreditCard size={24} /></div>
                  <div><p className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-white">Total em Dívida Efetiva</p><p className="text-2xl md:text-3xl font-black text-white">{state.debts.reduce((a, b) => a + Number(b.remainingValue), 0).toLocaleString('pt-PT')}{currencySymbol}</p></div>
                </div>
                <div className="bg-white/10 p-4 rounded-[24px] backdrop-blur-md flex items-center gap-4 flex-1 min-w-[200px]">
                  <div className="w-12 h-12 bg-white text-orange-600 rounded-2xl flex items-center justify-center"><Layers size={24} /></div>
                  <div><p className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-white">Carga Mensal Fixa</p><p className="text-2xl md:text-3xl font-black text-white">{(state.debts.reduce((a, b) => a + Number(b.monthlyPayment), 0) + state.recurringExpenses.reduce((a, b) => a + Number(b.amount), 0)).toLocaleString('pt-PT')}{currencySymbol}</p></div>
                </div>
              </div>
            </SectionCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {state.debts.map(debt => (
                <SectionCard
                  key={debt.id}
                  title={debt.name}
                  subtitle={`${debt.type} • Capital: ${(debt.contractedValue || 0).toLocaleString('pt-PT')}${currencySymbol}`}
                  icon={getCategoryIcon(debt.type === 'Carro' ? 'Transporte' : 'Habitação')}
                  headerAction={
                    <div className="flex gap-2">
                      <button onClick={() => { setEditContext({ id: debt.id, type: 'debt' }); setBackofficeSubTab('past'); setActiveTab('backoffice'); }} className="p-3 text-slate-300 hover:text-blue-600 rounded-xl transition-all hover:bg-white border border-transparent hover:border-slate-100"><Pencil size={18} /></button>
                      <button onClick={() => { if (confirm('Deseja eliminar esta dívida?')) removeDebt(debt.id); }} className="p-3 text-slate-300 hover:text-rose-600 rounded-xl transition-all hover:bg-white border border-transparent hover:border-slate-100"><Trash2 size={18} /></button>
                    </div>
                  }
                >
                  <div className="flex justify-between items-end mb-3"><p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Estado do Financiamento</p><p className="text-lg font-black text-orange-600">{(debt.monthlyPayment || 0).toLocaleString('pt-PT')}{currencySymbol}/mês</p></div>
                  <div className="p-4 bg-slate-50 rounded-2xl border mb-6"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Remanescente</p><p className="text-2xl font-black text-slate-800">{(debt.remainingValue || 0).toLocaleString('pt-PT')}{currencySymbol}</p></div>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                    <div><p className="text-[10px] text-slate-400 uppercase font-bold">Modo Cálculo</p><p className="text-sm font-bold text-slate-800">{debt.calculationType === 'installments' ? 'Prestações' : 'Data Fim'}</p></div>
                    <div className="text-right"><p className="text-[10px] text-slate-400 uppercase font-bold">Dia Liquidação</p><p className="text-sm font-bold text-slate-800">{debt.dayOfMonth || '-'}</p></div>
                    <div><p className="text-[10px] text-slate-400 uppercase font-bold">Fim Previsto</p><p className="text-sm font-bold text-slate-800">{debt.calculationType === 'endDate' ? debt.endDate : `${debt.remainingInstallments} meses`}</p></div>
                  </div>
                </SectionCard>
              ))}
              <button onClick={() => { setBackofficeSubTab('past'); setActiveTab('backoffice'); }} className="min-h-[250px] border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-orange-400 transition-all group">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-orange-50"><PlusCircle size={32} /></div>
                <span className="font-black text-sm uppercase tracking-widest">Configurar Compromissos</span>
              </button>
            </div>
          </div>
        );
      case 'future':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <SectionCard variant="blue" title="Construir o Amanhã" icon={<TrendingUp size={150} />}>
              <div className="mt-8 flex flex-wrap gap-4 md:gap-8">
                <div className="bg-white/10 p-4 rounded-[24px] backdrop-blur-md flex items-center gap-4 flex-1 min-w-[200px]">
                  <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center"><Wallet size={24} /></div>
                  <div><p className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-white">Total Acumulado</p><p className="text-2xl md:text-3xl font-black text-white">{(state.goals.reduce((a, b) => a + Number(b.currentAmount), 0) + (state.investments?.reduce((a, b) => a + Number(b.amount), 0) || 0)).toLocaleString('pt-PT')}{currencySymbol}</p></div>
                </div>
                <div className="bg-white/10 p-4 rounded-[24px] backdrop-blur-md flex items-center gap-4 flex-1 min-w-[200px]">
                  <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center"><Sparkles size={24} /></div>
                  <div><p className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-white">Sonhos</p><p className="text-2xl md:text-3xl font-black text-white">{state.goals.reduce((a, b) => a + Number(b.currentAmount), 0).toLocaleString('pt-PT')}{currencySymbol}</p></div>
                </div>
                <div className="bg-white/10 p-4 rounded-[24px] backdrop-blur-md flex items-center gap-4 flex-1 min-w-[200px]">
                  <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center"><PieChart size={24} /></div>
                  <div><p className="text-[10px] uppercase tracking-widest font-bold opacity-60 text-white">Investimentos</p><p className="text-2xl md:text-3xl font-black text-white">{(state.investments?.reduce((a, b) => a + Number(b.amount), 0) || 0).toLocaleString('pt-PT')}{currencySymbol}</p></div>
                </div>
              </div>
            </SectionCard>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {state.goals.map(goal => {
                const remaining = Math.max(0, Number(goal.targetAmount) - Number(goal.currentAmount));
                const isAchieved = goal.isAchieved || Number(goal.currentAmount) >= Number(goal.targetAmount);
                return (
                  <SectionCard key={goal.id} title={goal.name} icon={getCategoryIcon(goal.category)}>
                    {isAchieved && (
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 bg-emerald-600/90 text-white font-black text-xl md:text-2xl uppercase py-6 w-full flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(16,185,129,0.4)] z-20 backdrop-blur-md border-y-4 border-white/30 pointer-events-none whitespace-nowrap">
                        <PartyPopper size={32} className="hidden sm:block" />
                        Sonho Alcançado
                        <PartyPopper size={32} className="hidden sm:block" />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-8"><div className="text-right"><p className="text-[10px] font-black text-slate-300 uppercase mb-1">Objetivo Final</p><p className="text-2xl font-black text-slate-800">{Number(goal.targetAmount).toLocaleString('pt-PT')}{currencySymbol}</p></div></div>
                    <div className="w-full bg-slate-50 h-6 rounded-full overflow-hidden p-1.5 border mb-10"><div className={`${isAchieved ? 'bg-emerald-500' : 'bg-blue-500'} h-full rounded-full transition-all duration-1000`} style={{ width: `${Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100)}%` }} /></div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-6">
                      <div><p className="text-[10px] text-slate-400 uppercase font-black mb-1">Saldo Atual</p><p className="text-xl font-bold text-slate-800">{Number(goal.currentAmount).toLocaleString('pt-PT')}{currencySymbol}</p></div>
                      <div className="text-right"><p className="text-[10px] text-slate-400 uppercase font-black mb-1">O que falta</p><p className={`text-xl font-black ${isAchieved ? 'text-emerald-600' : 'text-blue-600'}`}>{remaining.toLocaleString('pt-PT')}{currencySymbol}</p></div>
                    </div>
                    {!isAchieved && (
                      <div className="mt-6 flex flex-col gap-3">
                        {reinforcingGoalId === goal.id || removingGoalId === goal.id ? (
                          <div className="flex items-center gap-3"><input type="number" className="flex-1 bg-slate-50 border rounded-2xl px-6 py-4 font-black" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} autoFocus /><button onClick={() => reinforcingGoalId === goal.id ? transferToFuture(Number(customAmount), goal.id) : removeFromFuture(Number(customAmount), goal.id)} className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center"><Check size={24} /></button><button onClick={() => { setReinforcingGoalId(null); setRemovingGoalId(null); setCustomAmount(''); }} className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center"><X size={24} /></button></div>
                        ) : (
                          <div className="flex items-center gap-3"><Button fullWidth variant="blue" onClick={() => setReinforcingGoalId(goal.id)}>Reforçar</Button><button onClick={() => setRemovingGoalId(goal.id)} className="w-16 h-16 bg-white text-rose-600 rounded-3xl border flex items-center justify-center shadow-sm"><MinusCircle size={24} /></button></div>
                        )}
                      </div>
                    )}
                  </SectionCard>
                )
              })}

              {(state.investments || []).map(inv => (
                <SectionCard key={inv.id} title={inv.name} subtitle={inv.type} icon={<PieChart size={24} className="text-emerald-500" />}>
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Património Acumulado</p>
                      <p className="text-3xl font-black text-slate-800">{(inv.amount || 0).toLocaleString('pt-PT')}{currencySymbol}</p>
                    </div>
                    {inv.type === 'PPR' && <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Automático</div>}
                  </div>

                  {inv.type === 'PPR' && inv.monthlyReinforcement && (
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reforço Mensal</p>
                        <p className="text-xl font-black text-emerald-600">{inv.monthlyReinforcement.toLocaleString('pt-PT')}{currencySymbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dia do Mês</p>
                        <p className="text-xl font-black text-slate-800">{inv.dayOfMonth}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-slate-50">
                    <Button fullWidth variant="ghost-emerald" onClick={() => { setBackofficeSubTab('investments'); setActiveTab('backoffice'); }}>Gerir Ativo</Button>
                  </div>
                </SectionCard>
              ))}

              <button onClick={() => { setBackofficeSubTab('goals'); setActiveTab('backoffice'); }} className="min-h-[350px] border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-blue-600 transition-all group">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-500 transition-colors"><PlusCircle size={32} /></div>
                <span className="font-black text-sm uppercase tracking-widest">Novo Sonho</span>
              </button>

              <button onClick={() => { setBackofficeSubTab('investments'); setActiveTab('backoffice'); }} className="min-h-[350px] border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-emerald-600 transition-all group">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-500 transition-colors"><PlusCircle size={32} /></div>
                <span className="font-black text-sm uppercase tracking-widest">Novo Investimento</span>
              </button>

              <button onClick={() => { setBackofficeSubTab('past'); setActiveTab('backoffice'); }} className="min-h-[350px] border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-orange-600 transition-all group">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-orange-50 text-slate-400 group-hover:text-orange-500 transition-colors"><PlusCircle size={32} /></div>
                <span className="font-black text-sm uppercase tracking-widest">Configurar Estratégia</span>
              </button>
            </div>
          </div>
        );
      case 'irs': return <IRSIndicators state={state} onConfirm={() => setActiveTab('irs-confirmation')} currencySymbol={currencySymbol} />;
      case 'irs-confirmation': return <IRSConfirmationReport state={state} onUpdateTransaction={updateTransaction} currencySymbol={currencySymbol} />;
      case 'reports': return <ReportsPage state={state} currencySymbol={currencySymbol} />;
      case 'backoffice': return <Backoffice state={state} onUpdateState={updateGlobalState} initialSubTab={backofficeSubTab} initialEditId={editContext?.id} initialEditType={editContext?.type} onClearEdit={() => setEditContext(null)} currencySymbol={currencySymbol} />;
      default: return null;
    }
  };

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Saúde Financeira';
      case 'past': return 'Passado';
      case 'present': return FULL_MONTHS[new Date().getMonth()];
      case 'future': return 'Futuro';
      case 'backoffice': return 'Backoffice';
      case 'settings': return 'Configurações';
      case 'irs': return 'Indicadores de IRS';
      case 'irs-confirmation': return 'Auditoria Fiscal';
      case 'reports': return 'Exportação de Dados';
      default: return tab.charAt(0).toUpperCase() + tab.slice(1);
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div><div className="flex items-center gap-3 mb-2"><h2 className="text-4xl font-black text-slate-800 tracking-tight">{getPageTitle(activeTab)}</h2><div className="hidden sm:flex items-center gap-2">{isSyncing ? <span className="flex items-center gap-2 text-[10px] bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full font-black border border-amber-100"><Cloud size={12} className="animate-bounce" /> Cloud Sync</span> : <span className="flex items-center gap-2 text-[10px] bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full font-black border border-emerald-100"><CloudCheck size={12} /> Protegido</span>}</div></div></div>
        <div className="flex gap-4">
          <button onClick={handleGetAdvice} disabled={loadingAdvice} className={`flex items-center gap-3 px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${showAdvice ? 'bg-slate-800 text-white' : 'bg-white border text-slate-800'}`}>{loadingAdvice ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} className="text-emerald-500" />} IA Consultor</button>
          <button onClick={() => setActiveTab('present')} className="bg-emerald-600 text-white p-4 rounded-3xl shadow-lg hover:scale-105 transition-all"><PlusCircle size={24} /></button>
        </div>
      </div>
      {showAdvice && advice && (
        <div className="mb-10 bg-white p-10 rounded-[40px] shadow-xl border-l-8 border-emerald-600 animate-in fade-in slide-in-from-top-6"><div className="flex items-center gap-3 text-emerald-600 font-black mb-4 uppercase text-xs tracking-widest"><Sparkles size={18} /> Estratégia IA</div><p className="text-slate-600 text-lg leading-relaxed font-medium italic">"{advice}"</p></div>
      )}
      {renderContent()}
      {editingTransaction && <EditTransactionModal transaction={editingTransaction} onSave={updateTransaction} onDelete={deleteTransaction} onClose={() => setEditingTransaction(null)} currencySymbol={currencySymbol} />}
    </Layout>
  );
};

export default App;
