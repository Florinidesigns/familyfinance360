
import React from 'react';
import { FileText, Calculator, CheckCircle2, ChevronRight } from 'lucide-react';
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
  // Mapeamento de categorias da App para categorias do e-fatura
  const getTotalsByCategory = () => {
    const expenses = state.transactions.filter(t => t.type === 'saida');

    const totals: Record<string, number> = {};
    Object.keys(IRS_CONFIG).forEach(key => totals[key] = 0);

    expenses.forEach(exp => {
      const desc = exp.description.toLowerCase();
      const cat = exp.category;

      if (cat === 'Saúde') totals['Saúde'] += exp.amount;
      else if (cat === 'Educação') totals['Educação'] += exp.amount;
      else if (cat === 'Habitação') totals['Habitação'] += exp.amount;
      else if (desc.includes('oficina') || desc.includes('reparação auto') || desc.includes('mecânico')) totals['Reparação de Automóveis'] += exp.amount;
      else if (desc.includes('restaurante') || desc.includes('hotel') || desc.includes('alojamento') || desc.includes('café') || desc.includes('jantar')) totals['Restauração e Alojamento'] += exp.amount;
      else if (desc.includes('cabeleireiro') || desc.includes('barbeiro') || desc.includes('estética')) totals['Cabeleireiros'] += exp.amount;
      else if (cat === 'Animais' || desc.includes('veterinário') || desc.includes('clínica veterinária')) totals['Atividades Veterinárias'] += exp.amount;
      else if (desc.includes('passe') || desc.includes('autocarro') || desc.includes('comboio') || desc.includes('metro')) totals['Passes Mensais'] += exp.amount;
      else if (desc.includes('lar') || desc.includes('apoio domiciliário') || desc.includes('residência sénior')) totals['Lares'] += exp.amount;
      else if (desc.includes('moto') || desc.includes('mota') || desc.includes('motociclo')) totals['Reparação de Motociclos'] += exp.amount;
      else {
        // Por defeito, vai para Despesas Gerais Familiares
        totals['Despesas Gerais Familiares'] += exp.amount;
      }
    });

    return totals;
  };

  const totals = getTotalsByCategory();

  const calculateBenefits = () => {
    let totalBenefit = 0;
    const details = Object.entries(IRS_CONFIG).map(([key, config]) => {
      const expenseValue = totals[key] || 0;
      const rawBenefit = expenseValue * (config as any).percentage;
      const cappedBenefit = Math.min(rawBenefit, (config as any).maxBenefit);

      totalBenefit += cappedBenefit;

      return {
        name: key,
        expense: expenseValue,
        benefit: cappedBenefit,
        maxBenefit: (config as any).maxBenefit,
        color: (config as any).color,
        hasExpenses: expenseValue > 0
      };
    });

    return { totalBenefit, details };
  };

  const { totalBenefit, details } = calculateBenefits();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 transition-all duration-300 pb-20">
      {/* Header Simulator Look */}
      <div className="bg-slate-900 p-12 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 text-emerald-400 font-black uppercase text-xs tracking-[0.2em] mb-4">
              <Calculator size={20} /> e-fatura simulator
            </div>
            <h3 className="text-5xl font-black mb-4 tracking-tight leading-tight">
              {t.irs.accumulatedRefund}
            </h3>
            <p className="text-slate-400 max-w-lg text-lg leading-relaxed font-medium">
              Esta é uma estimativa baseada nas tuas despesas registadas. O valor real depende da tua retenção na fonte.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[48px] border border-white/10 flex flex-col items-center gap-6 min-w-[300px] shadow-inner">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 opacity-80 mb-2">Total Simulável</p>
              <p className="text-6xl font-black text-white flex items-start justify-center gap-1">
                {totalBenefit.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-2xl mt-2">{currencySymbol}</span>
              </p>
            </div>
            <button
              onClick={onConfirm}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <CheckCircle2 size={18} /> {t.irs.confirmIrs}
            </button>
          </div>
        </div>
        <FileText size={400} className="absolute -right-20 -bottom-40 opacity-5 pointer-events-none rotate-12" />
      </div>

      {/* Grid of e-fatura cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {details.map((item) => (
          <div
            key={item.name}
            className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1 relative group"
          >
            {/* Icon */}
            <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/10`}>
              {getCategoryIcon(item.name)}
            </div>

            {/* Title & Ceiling */}
            <div className="mb-4 text-center">
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight flex items-center justify-center min-h-[48px]">
                {item.name}
              </h4>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 bg-slate-50 dark:bg-slate-800/50 py-1 px-3 rounded-full inline-block">
                Teto: <span className="text-slate-600 dark:text-slate-200">{item.maxBenefit.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{currencySymbol}</span>
              </p>
            </div>

            {/* Progress Bar (Loading Type) */}
            <div className="w-full mb-6 px-2">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">OBJETIVO</span>
                <span className={`text-[10px] font-black ${item.benefit >= item.maxBenefit ? 'text-orange-500' : 'text-emerald-500'}`}>
                  {Math.min(100, Math.round((item.benefit / item.maxBenefit) * 100))}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${item.benefit >= item.maxBenefit ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    }`}
                  style={{ width: `${Math.min(100, (item.benefit / item.maxBenefit) * 100)}%` }}
                />
              </div>
            </div>

            {/* Main Value Box (Match Image) */}
            <div className="w-full bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-2xl py-4 px-6 mb-6 shadow-sm group-hover:border-emerald-100 dark:group-hover:border-emerald-900/30 transition-colors">
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1">
                {item.benefit.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{currencySymbol}</span>
              </p>
            </div>

            {/* Description Text (Match Image) */}
            <div className="flex-1 w-full">
              {item.hasExpenses ? (
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium px-2">
                  As suas despesas registadas neste setor totalizam <span className="font-bold text-slate-700 dark:text-slate-200">
                    {item.expense.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{currencySymbol}
                  </span>.
                </p>
              ) : (
                <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 font-medium px-2 italic">
                  Não tem despesas registadas para este setor.
                </p>
              )}
            </div>

            {/* Limit indicator subtle dot */}
            {item.benefit >= item.maxBenefit && (
              <div className="absolute top-4 right-4 w-3 h-3 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50" title="Limite atingido" />
            )}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
            <Calculator size={24} />
          </div>
          <div>
            <p className="text-sm font-black text-emerald-800 dark:text-emerald-200 uppercase tracking-widest">Informação Importante</p>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/60 font-medium">Estes valores são baseados no código do IRS e podem variar consoante o seu agregado familiar.</p>
          </div>
        </div>
        <a
          href="https://faturas.portaldasfinancas.gov.pt/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-300 hover:gap-3 transition-all uppercase tracking-widest"
        >
          Portal e-fatura <ChevronRight size={16} />
        </a>
      </div>
    </div>
  );
};

export default IRSIndicators;
