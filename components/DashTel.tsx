
import React, { useState } from 'react';
import SummaryCards from './SummaryCards';
import TransactionForm from './TransactionForm';
import { FinanceState, Transaction } from '../types';
import { TranslationType } from '../translations';
import { LogOut, Sparkles, History, Target, TrendingUp, Plus, Minus } from 'lucide-react';
import { apiService } from '../services/apiService';

interface DashTelProps {
    state: FinanceState;
    onNavigate: (tab: string) => void;
    onAddTransaction: (transaction: Transaction) => void;
    currencySymbol: string;
    t: TranslationType;
    locale: string;
}

const DashTel: React.FC<DashTelProps> = ({ state, onNavigate, onAddTransaction, currencySymbol, t, locale }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-20 transition-colors duration-300">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                    <Sparkles className="fill-emerald-600" /> Finanças360
                </h1>
                <button
                    onClick={() => apiService.logout()}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                    <LogOut size={20} />
                </button>
            </div>

            <div className="space-y-6">
                <div className="animate-in fade-in slide-in-from-bottom-2">


                    {/* Compact Banners */}
                    <div className="grid grid-cols-1 gap-3">
                        {/* Past Banner */}
                        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 text-orange-600">
                                <History size={60} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <History size={14} /> {t.nav.past}
                                </p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                    {((state.debts || []).reduce((acc, curr) => acc + Number(curr.remainingValue), 0)).toLocaleString(locale, { notation: 'standard', maximumFractionDigits: 0 })}{currencySymbol}
                                </p>
                            </div>
                        </div>

                        {/* Present Banner */}
                        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 text-emerald-600">
                                <Target size={60} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <Target size={14} /> {t.nav.present}
                                </p>
                                <p className={`text-2xl font-black ${((state.transactions || []).filter(t => t.type === 'entrada').reduce((acc, t) => acc + Number(t.amount), 0) - (state.transactions || []).filter(t => t.type === 'saida').reduce((acc, t) => acc + Number(t.amount), 0)) < 0 ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                                    {((state.transactions || []).filter(t => t.type === 'entrada').reduce((acc, t) => acc + Number(t.amount), 0) - (state.transactions || []).filter(t => t.type === 'saida').reduce((acc, t) => acc + Number(t.amount), 0)).toLocaleString(locale, { notation: 'standard', maximumFractionDigits: 0 })}{currencySymbol}
                                </p>
                            </div>
                        </div>

                        {/* Future Banner */}
                        <div className="bg-white dark:bg-slate-900 rounded-[28px] p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 text-blue-600">
                                <TrendingUp size={60} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <TrendingUp size={14} /> {t.nav.future}
                                </p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                    {((state.goals || []).reduce((acc, curr) => acc + Number(curr.currentAmount), 0)).toLocaleString(locale, { notation: 'standard', maximumFractionDigits: 0 })}{currencySymbol}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 delay-100">
                    <button
                        onClick={() => setIsFormVisible(!isFormVisible)}
                        className="w-full flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm mb-4"
                    >
                        <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                            {t.present.addTransaction}
                        </h2>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFormVisible ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none'}`}>
                            {isFormVisible ? <Minus size={20} /> : <Plus size={20} />}
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
            </div>
        </div>
    );
};

export default DashTel;
