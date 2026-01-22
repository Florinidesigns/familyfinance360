
import React, { useState, useEffect } from 'react';
import { Plus, Home, Car, TrendingUp, Wallet, Coins, History, Target, Calendar, CreditCard, PieChart, Briefcase, Clock, Layers, CalendarRange, Hash } from 'lucide-react';
import { FinanceState, LongTermDebt, FutureGoal, RecurringIncome, RecurringExpense, IncomeSource, Category, Investment, InvestmentType, Frequency } from '../types';
import { CATEGORIES, INCOME_SOURCES, getCategoryIcon } from '../constants';
import SectionCard from './ui/SectionCard';
import { Input, Select, Button } from './ui/FormElements';
import ItemRow from './ui/ItemRow';

interface Props {
  state: FinanceState;
  onUpdateState: (newState: Partial<FinanceState>) => void;
  initialSubTab?: 'present' | 'past' | 'goals';
  initialEditId?: string;
  initialEditType?: 'debt' | 'goal' | 'investment' | 'income' | 'expense';
  onClearEdit?: () => void;
}

const MONTHS = [
  { val: 1, name: 'Janeiro' }, { val: 2, name: 'Fevereiro' }, { val: 3, name: 'Março' },
  { val: 4, name: 'Abril' }, { val: 5, name: 'Maio' }, { val: 6, name: 'Junho' },
  { val: 7, name: 'Julho' }, { val: 8, name: 'Agosto' }, { val: 9, name: 'Setembro' },
  { val: 10, name: 'Outubro' }, { val: 11, name: 'Novembro' }, { val: 12, name: 'Dezembro' }
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

const Backoffice: React.FC<Props> = ({ state, onUpdateState, initialSubTab = 'present', initialEditId, initialEditType, onClearEdit }) => {
  const [activeTab, setActiveTab] = useState<'present' | 'past' | 'goals'>(initialSubTab);

  useEffect(() => {
    setActiveTab(initialSubTab);

    if (initialEditId && initialEditType) {
      if (initialEditType === 'debt') {
        const item = state.debts.find(d => d.id === initialEditId);
        if (item) editDebt(item);
      } else if (initialEditType === 'goal') {
        const item = state.goals.find(g => g.id === initialEditId);
        if (item) editGoal(item);
      } else if (initialEditType === 'investment') {
        const item = (state.investments || []).find(i => i.id === initialEditId);
        if (item) editInv(item);
      } else if (initialEditType === 'income') {
        const item = (state.recurringIncomes || []).find(i => i.id === initialEditId);
        if (item) editIncome(item);
      } else if (initialEditType === 'expense') {
        const item = (state.recurringExpenses || []).find(e => e.id === initialEditId);
        if (item) editExp(item);
      }
    }
  }, [initialSubTab, initialEditId, initialEditType]);

  const [newDebt, setNewDebt] = useState<Partial<LongTermDebt>>({
    name: '', type: 'Hipoteca', calculationType: 'installments', monthlyPayment: 0, contractedValue: 0, remainingInstallments: 0, endDate: '', dayOfMonth: 1
  });

  const [newGoal, setNewGoal] = useState<Partial<FutureGoal>>({
    name: '', targetAmount: 0, currentAmount: 0, category: 'Lazer'
  });

  const [newInvestment, setNewInvestment] = useState<Partial<Investment>>({
    name: '', amount: 0, type: 'PPR', dayOfMonth: 1, monthlyReinforcement: 0
  });

  const [newIncome, setNewIncome] = useState<Partial<RecurringIncome>>({
    name: '', amount: 0, source: 'Ordenado', dayOfMonth: 1
  });

  const [newRecurringExpense, setNewRecurringExpense] = useState<Partial<RecurringExpense>>({
    name: '', amount: 0, category: 'Lazer', frequency: 'Mensal', dayOfMonth: 1, month: new Date().getMonth() + 1, year: CURRENT_YEAR
  });

  const handleAddDebt = () => {
    if (!newDebt.name || !newDebt.monthlyPayment) return;
    let installmentsInTotal = 0;
    let remainingVal = 0;

    if (newDebt.calculationType === 'installments') {
      installmentsInTotal = Number(newDebt.remainingInstallments || 0);
      remainingVal = installmentsInTotal * Number(newDebt.monthlyPayment);
    } else if (newDebt.endDate) {
      const end = new Date(newDebt.endDate);
      const start = new Date();
      installmentsInTotal = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      remainingVal = Math.max(0, installmentsInTotal) * Number(newDebt.monthlyPayment);
    }

    const debt: LongTermDebt = {
      id: newDebt.id || Math.random().toString(36).substr(2, 9),
      name: newDebt.name!,
      type: newDebt.type as any,
      contractedValue: Number(newDebt.contractedValue || 0),
      monthlyPayment: Number(newDebt.monthlyPayment),
      calculationType: newDebt.calculationType as any,
      remainingInstallments: newDebt.calculationType === 'installments' ? installmentsInTotal : undefined,
      endDate: newDebt.calculationType === 'endDate' ? newDebt.endDate : undefined,
      totalValue: Number(newDebt.contractedValue || 0),
      remainingValue: remainingVal,
      dayOfMonth: Number(newDebt.dayOfMonth || 1)
    };

    if (newDebt.id) {
      onUpdateState({ debts: state.debts.map(d => d.id === newDebt.id ? debt : d) });
    } else {
      onUpdateState({ debts: [...state.debts, debt] });
    }
    setNewDebt({ name: '', type: 'Hipoteca', calculationType: 'installments', monthlyPayment: 0, contractedValue: 0, remainingInstallments: 0, endDate: '', dayOfMonth: 1 });
    if (onClearEdit) onClearEdit();
  };

  const calculateNextLiquidation = (expense: RecurringExpense): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = expense.dayOfMonth;
    const monthIndex = (expense.month || (today.getMonth() + 1)) - 1;
    let checkDate = new Date(expense.year || today.getFullYear(), monthIndex, day);
    const interval = expense.frequency === 'Mensal' ? 1 : expense.frequency === 'Trimestral' ? 3 : expense.frequency === 'Semestral' ? 6 : 12;
    while (checkDate <= today) checkDate.setMonth(checkDate.getMonth() + interval);
    return checkDate.toLocaleDateString('pt-PT');
  };

  const handleAddRecurringExpense = () => {
    if (!newRecurringExpense.name || !newRecurringExpense.amount || !newRecurringExpense.dayOfMonth) return;
    const expense: RecurringExpense = {
      id: newRecurringExpense.id || Math.random().toString(36).substr(2, 9),
      name: newRecurringExpense.name!,
      amount: Number(newRecurringExpense.amount),
      category: newRecurringExpense.category as Category,
      frequency: newRecurringExpense.frequency as Frequency,
      dayOfMonth: Number(newRecurringExpense.dayOfMonth),
      month: newRecurringExpense.frequency !== 'Mensal' ? Number(newRecurringExpense.month) : (new Date().getMonth() + 1),
      year: newRecurringExpense.frequency !== 'Mensal' ? Number(newRecurringExpense.year) : CURRENT_YEAR
    };
    if (newRecurringExpense.id) {
      onUpdateState({ recurringExpenses: (state.recurringExpenses || []).map(e => e.id === newRecurringExpense.id ? expense : e) });
    } else {
      onUpdateState({ recurringExpenses: [...(state.recurringExpenses || []), expense] });
    }
    setNewRecurringExpense({ name: '', amount: 0, category: 'Lazer', frequency: 'Mensal', dayOfMonth: 1, month: new Date().getMonth() + 1, year: CURRENT_YEAR });
    if (onClearEdit) onClearEdit();
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;
    const goal: FutureGoal = {
      id: newGoal.id || Math.random().toString(36).substr(2, 9),
      name: newGoal.name!,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: Number(newGoal.currentAmount || 0),
      category: newGoal.category as any
    };
    if (newGoal.id) {
      onUpdateState({ goals: state.goals.map(g => g.id === newGoal.id ? goal : g) });
    } else {
      onUpdateState({ goals: [...state.goals, goal] });
    }
    setNewGoal({ name: '', targetAmount: 0, currentAmount: 0, category: 'Lazer' });
    if (onClearEdit) onClearEdit();
  };

  const handleAddInvestment = () => {
    if (!newInvestment.name || !newInvestment.amount) return;
    const inv: Investment = {
      id: newInvestment.id || Math.random().toString(36).substr(2, 9),
      name: newInvestment.name!,
      amount: Number(newInvestment.amount),
      type: newInvestment.type as InvestmentType,
      dayOfMonth: newInvestment.type === 'PPR' ? Number(newInvestment.dayOfMonth || 1) : undefined,
      monthlyReinforcement: newInvestment.type === 'PPR' ? Number(newInvestment.monthlyReinforcement || 0) : undefined
    };
    if (newInvestment.id) {
      onUpdateState({ investments: (state.investments || []).map(i => i.id === newInvestment.id ? inv : i) });
    } else {
      onUpdateState({ investments: [...(state.investments || []), inv] });
    }
    setNewInvestment({ name: '', amount: 0, type: 'PPR', dayOfMonth: 1, monthlyReinforcement: 0 });
    if (onClearEdit) onClearEdit();
  };

  const handleAddIncome = () => {
    if (!newIncome.name || !newIncome.amount) return;
    const inc: RecurringIncome = {
      id: newIncome.id || Math.random().toString(36).substr(2, 9),
      name: newIncome.name!,
      amount: Number(newIncome.amount),
      source: newIncome.source as IncomeSource,
      dayOfMonth: Number(newIncome.dayOfMonth || 1)
    };
    if (newIncome.id) {
      onUpdateState({ recurringIncomes: (state.recurringIncomes || []).map(i => i.id === newIncome.id ? inc : i) });
    } else {
      onUpdateState({ recurringIncomes: [...(state.recurringIncomes || []), inc] });
    }
    setNewIncome({ name: '', amount: 0, source: 'Ordenado', dayOfMonth: 1 });
    if (onClearEdit) onClearEdit();
  };

  const removeDebt = (id: string) => onUpdateState({ debts: state.debts.filter(d => d.id !== id) });
  const removeGoal = (id: string) => onUpdateState({ goals: state.goals.filter(g => g.id !== id) });
  const removeInv = (id: string) => onUpdateState({ investments: (state.investments || []).filter(inv => inv.id !== id) });
  const removeIncome = (id: string) => onUpdateState({ recurringIncomes: (state.recurringIncomes || []).filter(i => i.id !== id) });
  const removeExp = (id: string) => onUpdateState({ recurringExpenses: (state.recurringExpenses || []).filter(e => e.id !== id) });

  const editIncome = (inc: RecurringIncome) => {
    setNewIncome({ ...inc });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editGoal = (goal: FutureGoal) => {
    setNewGoal({ ...goal });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editInv = (inv: Investment) => {
    setNewInvestment({ ...inv });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editExp = (exp: RecurringExpense) => {
    setNewRecurringExpense({ ...exp });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editDebt = (debt: LongTermDebt) => {
    setNewDebt({ ...debt });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const frequencies: Frequency[] = ['Mensal', 'Trimestral', 'Semestral', 'Anual'];
  const groupedExpenses = (state.recurringExpenses || []).reduce((acc, expense) => {
    const freq = expense.frequency;
    if (!acc[freq]) acc[freq] = [];
    acc[freq].push(expense);
    return acc;
  }, {} as Record<Frequency, RecurringExpense[]>);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <SectionCard
        title="Backoffice Financeiro"
        subtitle="Estruture os pilares da sua economia familiar."
        variant="slate"
        icon={<TrendingUp size={180} />}
      />

      <div className="flex flex-col gap-3 w-full max-w-5xl mx-auto">
        <div className="flex bg-white p-2 rounded-3xl border border-slate-100 w-full shadow-sm">
          <button onClick={() => setActiveTab('past')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'past' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-slate-400 hover:text-slate-600'}`}><History size={16} /> Estrutura do Passado</button>
          <button onClick={() => setActiveTab('present')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'present' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}><Target size={16} /> Estrutura do Presente</button>
          <button onClick={() => setActiveTab('goals')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'goals' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}><TrendingUp size={16} /> Estrutura do Futuro</button>
        </div>
      </div>

      {activeTab === 'present' && (
        <div className="space-y-8">
          <SectionCard title="Rendimentos Mensais (Ordenados)" icon={<Wallet size={24} className="text-emerald-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Input label="Descrição" placeholder="Descrição" value={newIncome.name} onChange={e => setNewIncome({ ...newIncome, name: e.target.value })} />
              <Select label="Fonte" value={newIncome.source} onChange={e => setNewIncome({ ...newIncome, source: e.target.value as any })}>
                {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Input label="Montante €" type="number" placeholder="0.00" value={newIncome.amount || ''} onChange={e => setNewIncome({ ...newIncome, amount: Number(e.target.value) })} />
              <Input label="Dia Recebimento" type="number" min="1" max="31" icon={<Calendar size={18} />} value={newIncome.dayOfMonth || ''} onChange={e => setNewIncome({ ...newIncome, dayOfMonth: Number(e.target.value) })} />
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Button onClick={handleAddIncome} icon={<Plus size={18} />}>
                {newIncome.id ? 'Atualizar Rendimento Fixo' : 'Registar Rendimento Fixo'}
              </Button>
              {newIncome.id && <Button variant="ghost-slate" onClick={() => { setNewIncome({ name: '', amount: 0, source: 'Ordenado', dayOfMonth: 1 }); if (onClearEdit) onClearEdit(); }}>Cancelar</Button>}
            </div>

            {/* Integrated List */}
            <div className="mt-12 bg-slate-50/50 rounded-[32px] border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {(state.recurringIncomes || []).map(inc => (
                <ItemRow key={inc.id} variant="emerald" icon={<Coins size={24} />} title={inc.name} subtitle={`${inc.source} • Dia ${inc.dayOfMonth}`} value={`${(inc.amount || 0).toLocaleString('pt-PT')}€`} onEdit={() => editIncome(inc)} onDelete={() => removeIncome(inc.id)} />
              ))}
              {(state.recurringIncomes || []).length === 0 && (
                <div className="p-12 text-center text-slate-300">
                  <Briefcase size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="font-black text-xs uppercase tracking-widest">Nenhum rendimento fixo configurado</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-8">
          <SectionCard title="Compromissos Fixos (Recorrentes)" icon={<CreditCard size={24} className="text-orange-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
              <Select label="Frequência" variant="orange" value={newRecurringExpense.frequency} onChange={e => setNewRecurringExpense({ ...newRecurringExpense, frequency: e.target.value as Frequency })}>
                {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
              </Select>
              <Input label="Descrição" placeholder="Descrição" value={newRecurringExpense.name} onChange={e => setNewRecurringExpense({ ...newRecurringExpense, name: e.target.value })} />
              <Input label="Dia da Liq." type="number" min="1" max="31" variant="orange" icon={<Calendar size={16} />} value={newRecurringExpense.dayOfMonth || ''} onChange={e => setNewRecurringExpense({ ...newRecurringExpense, dayOfMonth: Number(e.target.value) })} />
              <Select label="Mês Ref." className={newRecurringExpense.frequency === 'Mensal' ? 'opacity-30' : ''} value={newRecurringExpense.month} onChange={e => setNewRecurringExpense({ ...newRecurringExpense, month: Number(e.target.value) })} disabled={newRecurringExpense.frequency === 'Mensal'}>
                {MONTHS.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
              </Select>
              <Select label="Ano Ref." className={newRecurringExpense.frequency === 'Mensal' ? 'opacity-30' : ''} value={newRecurringExpense.year} onChange={e => setNewRecurringExpense({ ...newRecurringExpense, year: Number(e.target.value) })} disabled={newRecurringExpense.frequency === 'Mensal'}>
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </Select>
              <Input label="Montante €" type="number" placeholder="0.00" value={newRecurringExpense.amount || ''} onChange={e => setNewRecurringExpense({ ...newRecurringExpense, amount: Number(e.target.value) })} />
              <Select label="Categoria" value={newRecurringExpense.category} onChange={e => setNewRecurringExpense({ ...newRecurringExpense, category: e.target.value as any })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Button variant="orange" onClick={handleAddRecurringExpense} icon={<Plus size={18} />}>
                {newRecurringExpense.id ? 'Atualizar Compromisso' : 'Adicionar Compromisso'}
              </Button>
              {newRecurringExpense.id && <Button variant="ghost-slate" onClick={() => { setNewRecurringExpense({ name: '', amount: 0, category: 'Lazer', frequency: 'Mensal', dayOfMonth: 1, month: new Date().getMonth() + 1, year: CURRENT_YEAR }); if (onClearEdit) onClearEdit(); }}>Cancelar</Button>}
            </div>

            {/* Integrated List grouped by frequency */}
            <div className="space-y-6 mt-12 px-2">
              {frequencies.map(freq => {
                const expenses = groupedExpenses[freq] || [];
                if (expenses.length === 0) return null;
                return (
                  <div key={freq} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-50">
                      <h5 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <Layers size={14} className="text-orange-500" /> {freq}
                      </h5>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {expenses.map(exp => (
                        <ItemRow key={exp.id} variant="orange" icon={getCategoryIcon(exp.category)} title={exp.name} subtitle={`${exp.frequency} • Próxima: ${calculateNextLiquidation(exp)}`} value={`${(exp.amount || 0).toLocaleString('pt-PT')}€`} onEdit={() => editExp(exp)} onDelete={() => removeExp(exp.id)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Créditos e Financiamentos" icon={<Home size={24} className="text-orange-600" />}>
            <div className="mb-10 p-2 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center gap-2 w-fit">
              <button onClick={() => setNewDebt({ ...newDebt, calculationType: 'installments' })} className={`px-8 py-3 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${newDebt.calculationType === 'installments' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400'}`}><Hash size={14} /> Nº Prestações</button>
              <button onClick={() => setNewDebt({ ...newDebt, calculationType: 'endDate' })} className={`px-8 py-3 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${newDebt.calculationType === 'endDate' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400'}`}><CalendarRange size={14} /> Data de Fim</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-6">
              <Input label="Descrição" placeholder="Descrição" value={newDebt.name} onChange={e => setNewDebt({ ...newDebt, name: e.target.value })} />
              <Select label="Tipo" value={newDebt.type} onChange={e => setNewDebt({ ...newDebt, type: e.target.value as any })}>
                <option value="Carro">Carro</option><option value="Empréstimo">Empréstimo</option><option value="Hipoteca">Hipoteca</option><option value="Outros">Outro</option>
              </Select>
              <Input label="Cap. Contratado" type="number" value={newDebt.contractedValue || ''} onChange={e => setNewDebt({ ...newDebt, contractedValue: Number(e.target.value) })} />
              <Input label="Dia Liq." type="number" min="1" max="31" variant="orange" icon={<Calendar size={16} />} value={newDebt.dayOfMonth || ''} onChange={e => setNewDebt({ ...newDebt, dayOfMonth: Number(e.target.value) })} />
              <Input label="Valor €" type="number" variant="orange" value={newDebt.monthlyPayment || ''} onChange={e => setNewDebt({ ...newDebt, monthlyPayment: Number(e.target.value) })} />
              {newDebt.calculationType === 'installments' ? <Input label="Nr. Prest." type="number" icon={<Hash size={18} />} value={newDebt.remainingInstallments || ''} onChange={e => setNewDebt({ ...newDebt, remainingInstallments: Number(e.target.value) })} /> : <Input label="Data Fim" type="date" icon={<CalendarRange size={18} />} value={newDebt.endDate} onChange={e => setNewDebt({ ...newDebt, endDate: e.target.value })} />}
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Button variant="orange" onClick={handleAddDebt} icon={<Plus size={18} />}>
                {newDebt.id ? 'Atualizar Financiamento' : 'Registar Financiamento'}
              </Button>
              {newDebt.id && <Button variant="ghost-slate" onClick={() => { setNewDebt({ name: '', type: 'Hipoteca', calculationType: 'installments', monthlyPayment: 0, contractedValue: 0, remainingInstallments: 0, endDate: '', dayOfMonth: 1 }); if (onClearEdit) onClearEdit(); }}>Cancelar</Button>}
            </div>

            {/* Integrated List */}
            <div className="mt-12 bg-white/5 rounded-[32px] border border-white/10 overflow-hidden divide-y divide-white/5">
              {state.debts.map(d => (
                <ItemRow key={d.id} variant="orange" icon={d.type === 'Carro' ? <Car size={24} /> : <Home size={24} />} title={d.name} subtitle={`${d.type} • Dia ${d.dayOfMonth || '-'} • Capital: ${(d.contractedValue || 0).toLocaleString('pt-PT')}€`} value={`${(d.monthlyPayment || 0).toLocaleString('pt-PT')}€`} onEdit={() => editDebt(d)} onDelete={() => removeDebt(d.id)} />
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-8">
          <SectionCard title="Sonhos e Objetivos de Futuro" icon={<TrendingUp size={24} className="text-blue-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input label="Descrição" placeholder="Descrição" value={newGoal.name} onChange={e => setNewGoal({ ...newGoal, name: e.target.value })} />
              <Input label="Valor Alvo €" type="number" value={newGoal.targetAmount || ''} onChange={e => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })} />
              <Select label="Categoria" value={newGoal.category} onChange={e => setNewGoal({ ...newGoal, category: e.target.value as any })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Button variant="blue" onClick={handleAddGoal} icon={<Plus size={18} />}>
                {newGoal.id ? 'Atualizar Objetivo' : 'Criar Novo Objetivo'}
              </Button>
              {newGoal.id && <Button variant="ghost-slate" onClick={() => { setNewGoal({ name: '', targetAmount: 0, currentAmount: 0, category: 'Lazer' }); if (onClearEdit) onClearEdit(); }}>Cancelar</Button>}
            </div>

            {/* Integrated List */}
            <div className="mt-12 bg-slate-50/50 rounded-[32px] border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {state.goals.map(g => (
                <ItemRow key={g.id} variant="blue" icon={<TrendingUp size={24} />} title={g.name} subtitle={`${(g.targetAmount || 0).toLocaleString('pt-PT')}€ Alvo`} onEdit={() => editGoal(g)} onDelete={() => removeGoal(g.id)} />
              ))}
            </div>
          </SectionCard>

          <SectionCard variant="slate" title="Investimentos Estratégicos" icon={<PieChart size={24} className="text-emerald-500" />}>
            <div className={`grid grid-cols-1 md:grid-cols-2 ${newInvestment.type === 'PPR' ? 'lg:grid-cols-5' : 'lg:grid-cols-3'} gap-6 items-end`}>
              <Input variant="slate-emerald" label="Descrição" placeholder="Descrição" value={newInvestment.name} onChange={e => setNewInvestment({ ...newInvestment, name: e.target.value })} />
              <Input variant="slate-emerald" label="Valor Investido €" type="number" value={newInvestment.amount || ''} onChange={e => setNewInvestment({ ...newInvestment, amount: Number(e.target.value) })} />
              <Select variant="slate-emerald" label="Tipo" value={newInvestment.type} onChange={e => setNewInvestment({ ...newInvestment, type: e.target.value as any })}>
                <option value="Acções">Acções</option><option value="Certificados de Aforro">Certificados de Aforro</option><option value="Cryptomoeda">Cryptomoeda</option><option value="Outro">Outro</option><option value="PPR">PPR</option>
              </Select>
              {newInvestment.type === 'PPR' && (
                <>
                  <Input variant="slate-emerald" label="Valor Reforço €" type="number" value={newInvestment.monthlyReinforcement || ''} onChange={e => setNewInvestment({ ...newInvestment, monthlyReinforcement: Number(e.target.value) })} />
                  <Input variant="slate-emerald" label="Dia Reforço" type="number" min="1" max="31" value={newInvestment.dayOfMonth || ''} onChange={e => setNewInvestment({ ...newInvestment, dayOfMonth: Number(e.target.value) })} />
                </>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Button variant="emerald" noShadow onClick={handleAddInvestment} icon={<Plus size={18} />}>
                {newInvestment.id ? 'Atualizar Investimento' : 'Registar Investimento'}
              </Button>
              {newInvestment.id && <Button variant="ghost-slate" onClick={() => { setNewInvestment({ name: '', amount: 0, type: 'PPR', dayOfMonth: 1, monthlyReinforcement: 0 }); if (onClearEdit) onClearEdit(); }}>Cancelar</Button>}
            </div>

            {/* Integrated List */}
            <div className="mt-12 bg-white/5 rounded-[32px] border border-white/10 overflow-hidden divide-y divide-white/5">
              {(state.investments || []).map(inv => (
                <ItemRow key={inv.id} variant="blue" icon={<Wallet size={24} />} title={inv.name} subtitle={inv.type === 'PPR' ? `${inv.type} • Reforço: ${inv.monthlyReinforcement}€ (Dia ${inv.dayOfMonth})` : inv.type} value={`${(inv.amount || 0).toLocaleString('pt-PT')}€`} onEdit={() => editInv(inv)} onDelete={() => removeInv(inv.id)} />
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default Backoffice;
