
import React from 'react';
import { FileCheck, AlertCircle, CheckCircle2, Search, UserMinus, RotateCcw, Receipt } from 'lucide-react';
import { FinanceState, Transaction } from '../types';
import { getCategoryIcon } from '../constants';

import { TranslationType } from '../translations';

interface Props {
  state: FinanceState;
  onUpdateTransaction?: (updated: Transaction) => void;
  currencySymbol: string;
  t: TranslationType;
  locale: string;
}

const IRSConfirmationReport: React.FC<Props> = ({ state, onUpdateTransaction, currencySymbol, t, locale }) => {
  const expenses = state.transactions.filter(t => t.type === 'saida');

  const irsGroups = [
    { name: t.irsReport.groups.health, categories: ['Saúde'] },
    { name: t.irsReport.groups.education, categories: ['Educação'] },
    { name: t.irsReport.groups.housing, categories: ['Habitação'] },
    { name: t.irsReport.groups.leisure, categories: ['Lazer', 'Animais'] },
    { name: t.irsReport.groups.general, categories: ['Alimentação', 'Despesas', 'Outros', 'Seguros'] }
  ];

  const getTransactionsByGroup = (categories: string[]) => {
    return expenses.filter(t => categories.includes(t.category));
  };

  const handleToggleNoNif = (tx: Transaction) => {
    if (onUpdateTransaction) {
      onUpdateTransaction({
        ...tx,
        isNoNif: !tx.isNoNif,
        invoiceNumber: undefined
      });
    }
  };

  const totalCount = expenses.length;
  const pendingCount = expenses.filter(t => !t.invoiceNumber && !t.isNoNif).length;
  const validatedCount = expenses.filter(t => !!t.invoiceNumber).length;
  const noNifCount = expenses.filter(t => t.isNoNif).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-emerald-900 p-10 rounded-[40px] text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-2 flex items-center gap-3"><FileCheck className="text-emerald-400" /> {t.irsReport.title}</h3>
          <p className="opacity-70 max-w-2xl text-lg">{t.irsReport.subtitle}</p>
        </div>
        <FileCheck size={200} className="absolute -right-10 -bottom-20 opacity-5 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4"><div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Receipt size={24} /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.irsReport.totalInvoices}</p><p className="text-2xl font-black text-slate-800">{totalCount}</p></div></div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4"><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><CheckCircle2 size={24} /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.irsReport.validated}</p><p className="text-2xl font-black text-slate-800">{validatedCount}</p></div></div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4"><div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><AlertCircle size={24} /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.irsReport.pending}</p><p className="text-2xl font-black text-rose-600">{pendingCount}</p></div></div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4"><div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center"><UserMinus size={24} /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.irsReport.noNif}</p><p className="text-2xl font-black text-slate-500">{noNifCount}</p></div></div>
      </div>

      {irsGroups.map((group) => {
        const groupTransactions = getTransactionsByGroup(group.categories);
        if (groupTransactions.length === 0) return null;
        const groupTotal = groupTransactions.reduce((a, b) => a + b.amount, 0);

        return (
          <div key={group.name} className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3"><div className="p-3 bg-white shadow-sm rounded-xl text-slate-600">{getCategoryIcon(group.categories[0])}</div><h4 className="text-xl font-black text-slate-800">{group.name}</h4></div>
              <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p><p className="text-xl font-black text-emerald-600">{groupTotal.toLocaleString(locale)}{currencySymbol}</p></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50"><tr><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.present.date}</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.reports.entityDescription}</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.irsReport.invoiceStatus}</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">{t.present.amount}</th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {groupTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-all group/row">
                      <td className="px-8 py-4 text-xs font-medium text-slate-500">{tx.date}</td>
                      <td className="px-8 py-4"><p className="text-sm font-bold text-slate-800">{tx.description}</p>{tx.establishment && <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">@ {tx.establishment}</p>}</td>
                      <td className="px-8 py-4"><div className="flex items-center gap-3">{tx.invoiceNumber ? <div className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-tighter">{tx.invoiceNumber}</div> : tx.isNoNif ? <div className="text-slate-400 font-bold text-[10px] bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-tighter">{t.reports.excel.noNif}</div> : <div className="text-rose-500 font-bold text-[10px] bg-rose-50 px-3 py-1.5 rounded-full uppercase tracking-tighter">{t.reports.excel.pending}</div>}</div></td>
                      <td className="px-8 py-4 text-sm font-black text-slate-800 text-right">{tx.amount.toLocaleString(locale)}{currencySymbol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IRSConfirmationReport;
