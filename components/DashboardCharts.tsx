
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, LabelList
} from 'recharts';
import { Transaction } from '../types';
import { BarChart3, PieChart as PieChartIcon, LayoutGrid, Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import { getCategoryIcon } from '../constants';

import { TranslationType } from '../translations';

interface Props {
  transactions: Transaction[];
  currencySymbol: string;
  t: TranslationType;
  locale: string;
}

type Period = 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'total';

const DashboardCharts: React.FC<Props> = ({ transactions, currencySymbol, t, locale }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('total'); // Alterado para 'total' para garantir que os dados apareçam sempre por defeito

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#2dd4bf', '#fb7185'];

  // 1. Filtragem por Período de Tempo
  const filteredByPeriod = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter(t => {
      const tDate = new Date(t.date);
      // Fix: Use explicit number conversion to avoid arithmetic operation errors
      const diffTime = Math.abs(Number(now.getTime()) - Number(tDate.getTime()));
      const diffDays = Math.ceil(Number(diffTime) / (1000 * 60 * 60 * 24));

      switch (period) {
        case 'mensal':
          return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        case 'trimestral':
          return diffDays <= 90;
        case 'semestral':
          return diffDays <= 180;
        case 'anual':
          return tDate.getFullYear() === currentYear;
        case 'total':
          return true;
        default:
          return true;
      }
    });
  }, [transactions, period]);

  // 2. Resumo de Categorias para os Botões
  const categorySummary = useMemo(() => {
    const expenses = filteredByPeriod.filter(t => t.type === 'saida');
    const summary = expenses.reduce((acc: Record<string, number>, t) => {
      const cat = t.category as string;
      // Fix for line 62: Use explicit number conversion to ensure arithmetic operations work correctly
      acc[cat] = (Number(acc[cat]) || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(summary)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => Number(b.value) - Number(a.value));
  }, [filteredByPeriod]);

  // 3. Dados do Gráfico (Drill-down por fatura/descrição)
  const chartData = useMemo(() => {
    const expenses = filteredByPeriod.filter(t => t.type === 'saida');

    if (!activeCategory) {
      // VISÃO GLOBAL: Agrupa por CATEGORIA
      const grouped = expenses.reduce((acc: Record<string, number>, t) => {
        const cat = t.category as string;
        // Ensure operands are treated as numbers
        acc[cat] = (Number(acc[cat]) || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(grouped).map(([name, value]) => ({ name, value: Number(value) }));
    } else {
      // VISÃO DRILL-DOWN: Agrupa por DESCRIÇÃO/FATURA dentro da categoria selecionada
      const filtered = expenses.filter(t => t.category === activeCategory);

      const grouped = filtered.reduce((acc: Record<string, number>, t) => {
        const subLabel = (activeCategory === 'Alimentação' && t.establishment)
          ? t.establishment
          : (t.description || t.establishment || 'Vários');

        // Fix for line 93 (shifted to 97): Ensure operands are treated as numbers
        acc[subLabel] = (Number(acc[subLabel]) || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(grouped)
        .map(([name, value]) => ({ name, value: Number(value) }))
        .sort((a, b) => Number(b.value) - Number(a.value));
    }
  }, [filteredByPeriod, activeCategory]);

  const hasData = chartData.length > 0;

  return (
    <div className="space-y-8 mb-8 animate-in fade-in duration-700">

      {/* FILTROS E SELEÇÃO */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">

        {/* Seletor de Período */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50 pb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{t.dashboard.timeHorizon}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t.dashboard.filterAnalysis}</p>
            </div>
          </div>

          <div className="flex flex-wrap bg-slate-50 p-1.5 rounded-2xl border border-slate-100 gap-1">
            {(['mensal', 'trimestral', 'semestral', 'anual', 'total'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                  }`}
              >
                {t.dashboard.periods[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Seletor de Categorias */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <LayoutGrid size={14} /> {t.dashboard.activeCategories}
            </h3>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
              >
                <ArrowLeft size={12} /> {t.dashboard.clearFilter}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all duration-300 ${activeCategory === null
                ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105'
                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                }`}
            >
              <LayoutGrid size={18} />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-tighter opacity-60 leading-none mb-1">{t.dashboard.general}</p>
                <p className="text-xs font-black leading-none">{t.dashboard.all}</p>
              </div>
            </button>

            {categorySummary.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all duration-300 group ${activeCategory === cat.name
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl scale-105 shadow-emerald-100'
                  : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'
                  }`}
              >
                <div className={`${activeCategory === cat.name ? 'text-white' : 'text-emerald-500'} group-hover:scale-110 transition-transform`}>
                  {getCategoryIcon(cat.name)}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-tighter opacity-60 leading-none mb-1">{cat.name}</p>
                  <p className={`text-xs font-black leading-none ${activeCategory === cat.name ? 'text-white' : 'text-slate-800'}`}>
                    {cat.value.toLocaleString(locale)}{currencySymbol}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <BarChart3 size={24} className="text-emerald-500" />
                {activeCategory ? `${t.dashboard.billsFrom} ${activeCategory}` : t.dashboard.spendingDistribution}
              </h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                {t.dashboard.periods[period]} • {activeCategory ? t.dashboard.individualItems : t.dashboard.comparative}
              </p>
            </div>
          </div>

          <div className="flex-1 w-full flex items-center justify-center">
            {hasData ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#94a3b8', fontWeight: 800 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: '#f8fafc', radius: 12 }}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    formatter={(value: number) => [`${Number(value).toLocaleString(locale)}${currencySymbol}`, t.dashboard.volume]}
                  />
                  <Bar
                    dataKey="value"
                    radius={[12, 12, 4, 4]}
                    className="cursor-pointer"
                    onClick={(data) => { if (!activeCategory) setActiveCategory(data.name); }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(val: number) => `${Math.round(Number(val))}${currencySymbol}`}
                      style={{ fontSize: '11px', fill: '#1e293b', fontWeight: 900 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center gap-4 text-slate-300">
                <AlertCircle size={48} />
                <p className="font-black text-xs uppercase tracking-[0.2em]">{t.dashboard.noData}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <PieChartIcon size={24} className="text-blue-500" />
                {t.dashboard.budgetWeight}
              </h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{t.dashboard.budgetWeight} {t.dashboard.periods[period]}</p>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col items-center justify-center">
            {hasData ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                      onClick={(data) => { if (!activeCategory) setActiveCategory(data.name); }}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${Number(value).toLocaleString(locale)}${currencySymbol}`, 'Volume']}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {chartData.slice(0, 8).map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 text-slate-300">
                <PieChartIcon size={48} />
                <p className="font-black text-xs uppercase tracking-[0.2em]">{t.dashboard.analysisUnavailable}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
