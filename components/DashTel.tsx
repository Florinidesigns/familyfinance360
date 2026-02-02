
import React, { useState } from 'react';
import SummaryCards from './SummaryCards';
import TransactionForm from './TransactionForm';
import { FinanceState, Transaction } from '../types';
import { LogOut, Sparkles, History, Target, TrendingUp, Plus, Minus } from 'lucide-react';
import { TranslationType } from '../translations';

interface DashTelProps {
    state: FinanceState;
    onNavigate: (tab: string) => void;
    onLogout: () => void;
    onAddTransaction: (transaction: Transaction) => void;
    currencySymbol: string;
    t: TranslationType;
    locale: string;
}

const DashTel: React.FC<DashTelProps> = ({ state, onNavigate, onLogout, onAddTransaction, currencySymbol, t, locale }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-20 transition-colors duration-300">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                    <Sparkles className="fill-emerald-600" /> Finanças360
                </h1>
                <button
                    onClick={onLogout}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                    <LogOut size={20} />
                </button>
            </div>

            <div className="space-y-3">
                {/* Add Transaction Button and Form - Moved to top */}
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <button
                        onClick={() => setIsFormVisible(!isFormVisible)}
                        className="w-full flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm mb-3"
                    >
                        <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                            {t.present.addTransaction}
                        </h2>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isFormVisible ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none'}`}>
                            {isFormVisible ? <Minus size={16} /> : <Plus size={16} />}
                        </div>
                    </button>

                    {isFormVisible && (
                        <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                            <TransactionForm
                                onAdd={onAddTransaction}
                                currencySymbol={currencySymbol}
                                t={t}
                            />
                        </div>
                    )}
                </div>

                {/* Compact Banners */}
                <div className="animate-in fade-in slide-in-from-bottom-4 delay-100">
                    <div className="grid grid-cols-1 gap-3">
                        {/* Past Banner */}
                        <div className="bg-orange-600 rounded-[28px] p-4 shadow-lg shadow-orange-200 dark:shadow-none border border-orange-500 flex items-center justify-between group overflow-hidden relative min-h-[90px]">
                            <div className="absolute -right-5 -bottom-5 opacity-20 text-white">
                                <History size={100} />
                            </div>
                            <div className="relative z-10 w-full">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-[10px] font-black text-white/90 uppercase tracking-widest flex items-center gap-2">
                                        <History size={14} /> {t.nav.past}
                                    </p>
                                </div>
                                <p className="text-2xl font-black text-white">
                                    {((state.debts || []).reduce((acc, curr) => acc + Number(curr.remainingValue), 0)).toLocaleString(locale, { notation: 'standard', maximumFractionDigits: 0 })}{currencySymbol}
                                </p>
                            </div>
                        </div>

                        {/* Present Banner */}
                        <div className="bg-emerald-600 rounded-[28px] p-4 shadow-lg shadow-emerald-200 dark:shadow-none border border-emerald-500 flex items-center justify-between group overflow-hidden relative min-h-[90px]">
                            <div className="absolute -right-5 -bottom-5 opacity-20 text-white">
                                <Target size={100} />
                            </div>
                            <div className="relative z-10 w-full">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-[10px] font-black text-white/90 uppercase tracking-widest flex items-center gap-2">
                                        <Target size={14} /> {t.nav.present}
                                    </p>
                                </div>
                                <p className="text-2xl font-black text-white">
                                    {((state.transactions || []).filter(t => t.type === 'entrada').reduce((acc, t) => acc + Number(t.amount), 0) - (state.transactions || []).filter(t => t.type === 'saida').reduce((acc, t) => acc + Number(t.amount), 0)).toLocaleString(locale, { notation: 'standard', maximumFractionDigits: 0 })}{currencySymbol}
                                </p>
                            </div>
                        </div>

                        {/* Future Banner */}
                        <div className="bg-blue-600 rounded-[28px] p-4 shadow-lg shadow-blue-200 dark:shadow-none border border-blue-500 flex items-center justify-between group overflow-hidden relative min-h-[90px]">
                            <div className="absolute -right-5 -bottom-5 opacity-20 text-white">
                                <TrendingUp size={100} />
                            </div>
                            <div className="relative z-10 w-full">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-[10px] font-black text-white/90 uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp size={14} /> {t.nav.future}
                                    </p>
                                </div>
                                <p className="text-2xl font-black text-white">
                                    {((state.goals || []).reduce((acc, curr) => acc + Number(curr.currentAmount), 0)).toLocaleString(locale, { notation: 'standard', maximumFractionDigits: 0 })}{currencySymbol}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashTel;
