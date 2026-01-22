
import React from 'react';
import { FileText, Info, AlertTriangle, CheckCircle2, TrendingUp, Calculator } from 'lucide-react';
import { FinanceState } from '../types';
import { IRS_CONFIG, getCategoryIcon } from '../constants';

import { TranslationType } from '../translations';

interface Props {
  state: FinanceState;
  onConfirm: () => void;
  currencySymbol: string;
  t: TranslationType;
  locale: string;
}

const IRSIndicators: React.FC<Props> = ({ state, onConfirm, currencySymbol, t, locale }) => {
  // Calcular totais por categoria de IRS
  const getTotalsByCategory = () => {
    const expenses = state.transactions.filter(t => t.type === 'saida');

    return {
      'Saúde': expenses.filter(t => t.category === 'Saúde').reduce((a, b) => a + b.amount, 0),
      'Educação': expenses.filter(t => t.category === 'Educação').reduce((a, b) => a + b.amount, 0),
      'Habitação': expenses.filter(t => t.category === 'Habitação').reduce((a, b) => a + b.amount, 0),
      'Outros': expenses.filter(t => t.category === 'Outros' || t.category === 'Alimentação' || t.category === 'Despesas').reduce((a, b) => a + b.amount, 0),
      // Lazer partilha benefício com Veterinário (Animais) em PT
      'Lazer': expenses.filter(t => t.category === 'Lazer' || t.category === 'Animais').reduce((a, b) => a + b.amount, 0)
    };
  };

  const totals = getTotalsByCategory();

  const calculateBenefits = () => {
    let totalBenefit = 0;
    const details = Object.entries(IRS_CONFIG).map(([key, config]) => {
      const expenseValue = totals[key as keyof typeof totals] || 0;
      const rawBenefit = expenseValue * config.percentage;
      const cappedBenefit = Math.min(rawBenefit, config.maxBenefit);
      const isOverLimit = rawBenefit > config.maxBenefit;
      const percentageOfLimit = (cappedBenefit / config.maxBenefit) * 100;

      totalBenefit += cappedBenefit;

      return {
        name: key,
        expense: expenseValue,
        benefit: cappedBenefit,
        rawBenefit,
        maxBenefit: config.maxBenefit,
        percentage: config.percentage,
        isOverLimit,
        percentageOfLimit,
        description: config.description
      };
    });

    return { totalBenefit, details };
  };

  const { totalBenefit, details } = calculateBenefits();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 transition-colors duration-300">
      <div className="bg-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 font-black uppercase text-xs tracking-widest mb-4"><Calculator size={18} /> {t.irs.simulatorTitle}</div>
            <h3 className="text-4xl font-black mb-2">{t.irs.accumulatedRefund}</h3>
            <p className="opacity-60 max-w-md">{t.irs.refundEstimateDesc}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border border-white/20 flex flex-col items-center gap-4 min-w-[240px]">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t.irs.totalRecoverable}</p>
              <p className="text-5xl font-black text-emerald-400">{totalBenefit.toLocaleString(locale)}{currencySymbol}</p>
            </div>
            <button
              onClick={onConfirm}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={14} /> {t.irs.confirmIrs}
            </button>
          </div>
        </div>
        <FileText size={200} className="absolute -right-10 -bottom-20 opacity-5 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {details.map((item) => (
          <div key={item.name} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm relative group transition-all hover:shadow-xl dark:hover:border-slate-700">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${item.isOverLimit ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'}`}>{getCategoryIcon(item.name)}</div>
                <div><h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.categories[item.name as keyof typeof t.categories] || item.name}</h4><p className="text-slate-400 dark:text-slate-500 text-xs font-medium">{item.description}</p></div>
              </div>
              <div className="text-right"><p className={`text-xl font-black ${item.isOverLimit ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-slate-100'}`}>{item.benefit.toLocaleString(locale)}{currencySymbol}</p><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{t.irs.realBenefit}</p></div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2"><p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t.irs.ceilingProgress}</p>{item.isOverLimit && <span className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse"><AlertTriangle size={10} /> {t.irs.limitReached}</span>}</div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-100">{Math.round(item.percentageOfLimit)}%</p>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 rounded-full ${item.isOverLimit ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(item.percentageOfLimit, 100)}%` }} /></div>
              100:               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                101:                 <div><p className="text-[10px] text-slate-400 uppercase font-bold">{t.irs.totalExpense}</p><p className="text-lg font-bold text-slate-800">{item.expense.toLocaleString(locale)}{currencySymbol}</p></div>
                102:                 <div className="text-right"><p className="text-[10px] text-slate-400 uppercase font-bold">{t.irs.maxCeiling}</p><p className="text-lg font-bold text-slate-400">{item.maxBenefit.toLocaleString(locale)}{currencySymbol}</p></div>
                103:               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IRSIndicators;
