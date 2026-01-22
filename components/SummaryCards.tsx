
import React from 'react';
import { History, Target, TrendingUp, Info, ChevronRight } from 'lucide-react';
import { FinanceState } from '../types';
import { TranslationType } from '../translations';

interface Props {
  state: FinanceState;
  onNavigate: (tab: string) => void;
  currencySymbol: string;
  t: TranslationType;
}

const SummaryCards: React.FC<Props> = ({ state, onNavigate, currencySymbol, t }) => {
  const totalDebt = (state.debts || []).reduce((acc, curr) => acc + Number(curr.remainingValue), 0);
  const monthlyInflow = (state.transactions || []).filter(t => t.type === 'entrada').reduce((acc, t) => acc + Number(t.amount), 0);
  const monthlyOutflow = (state.transactions || []).filter(t => t.type === 'saida').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalSavings = (state.goals || []).reduce((acc, curr) => acc + Number(curr.currentAmount), 0);

  const totalFixedIn = (state.recurringIncomes || []).reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalFixedOut = (state.debts || []).reduce((acc, curr) => acc + Number(curr.monthlyPayment), 0) +
    (state.recurringExpenses || []).reduce((acc, curr) => acc + Number(curr.amount), 0);
  const effortRate = totalFixedIn > 0 ? (totalFixedOut / totalFixedIn) * 100 : 0;

  const getEffortRateColor = (rate: number) => {
    if (rate <= 35) return 'text-emerald-500';
    if (rate <= 50) return 'text-orange-500';
    return 'text-rose-500';
  };

  const cards = [
    {
      id: 'past',
      label: t.nav.past,
      title: t.dashboard.pastTitle,
      value: totalDebt,
      icon: <History size={16} />,
      bgIcon: <History size={80} />,
      color: 'text-orange-600',
      info: t.dashboard.pastInfo,
      accent: 'hover:border-orange-200'
    },
    {
      id: 'present',
      label: t.nav.present,
      title: t.dashboard.presentTitle,
      value: monthlyInflow - monthlyOutflow,
      extra: {
        label: t.dashboard.effortRate,
        value: `${effortRate.toFixed(1)}%`,
        color: getEffortRateColor(effortRate)
      },
      icon: <Target size={16} />,
      bgIcon: <Target size={80} />,
      color: 'text-emerald-600',
      info: t.dashboard.presentInfo,
      accent: 'hover:border-emerald-200'
    },
    {
      id: 'future',
      label: t.nav.future,
      title: t.dashboard.futureTitle,
      value: totalSavings,
      icon: <TrendingUp size={16} />,
      bgIcon: <TrendingUp size={80} />,
      color: 'text-blue-600',
      info: t.dashboard.futureInfo,
      accent: 'hover:border-blue-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => onNavigate(card.id)}
          className={`bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group text-left transition-all hover:shadow-xl hover:-translate-y-1 ${card.accent}`}
        >
          <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${card.color}`}>
            {card.bgIcon}
          </div>
          <div className={`flex items-center gap-2 font-bold mb-4 uppercase text-[10px] tracking-[0.2em] ${card.color}`}>
            {card.icon} {card.label}
          </div>
          <h3 className="text-slate-500 text-xs mb-1 font-medium">{card.title}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <p className={`text-3xl font-bold ${card.id === 'present' && card.value < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {card.value.toLocaleString('pt-PT')}{currencySymbol}
              </p>
            </div>
            {(card as any).extra && (
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-0.5">{(card as any).extra.label}</p>
                <p className={`text-lg font-black ${(card as any).extra.color}`}>{(card as any).extra.value}</p>
              </div>
            )}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <Info size={12} /> {card.info}
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:bg-slate-50 ${card.color}`}>
              <ChevronRight size={18} />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SummaryCards;
