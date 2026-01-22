
import React from 'react';
import { Receipt, FileText, CheckCircle2, AlertCircle, Calendar, Store, Tag } from 'lucide-react';
import { Transaction } from '../types';
import { getCategoryIcon } from '../constants';

interface Props {
  transactions: Transaction[];
  currencySymbol: string;
}

const InvoicesPage: React.FC<Props> = ({ transactions, currencySymbol }) => {
  const expenses = transactions.filter(t => t.type === 'saida');
  const invoices = expenses.filter(t => !!t.invoiceNumber);
  const totalInvoiced = invoices.reduce((acc, t) => acc + t.amount, 0);
  const pendingInvoices = expenses.filter(t => !t.invoiceNumber).length;

  const coveragePercent = expenses.length > 0
    ? Math.round((invoices.length / expenses.length) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" /> Cobertura de Faturas
          </p>
          <p className="text-4xl font-black text-slate-800">{coveragePercent}%</p>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${coveragePercent}%` }} />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Receipt size={14} className="text-blue-500" /> Total em Faturas
          </p>
          <p className="text-4xl font-black text-slate-800">{totalInvoiced.toLocaleString('pt-PT')}{currencySymbol}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">{invoices.length} documentos registados</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <AlertCircle size={14} className="text-rose-500" /> Por Regularizar
          </p>
          <p className="text-4xl font-black text-slate-800">{pendingInvoices}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Gastos sem número de fatura</p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-emerald-600" /> Arquivo Digital de Faturas
          </h3>
          <span className="text-[10px] bg-slate-900 text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
            {invoices.length} Documentos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fatura Nº</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estabelecimento</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoria</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Receipt size={18} />
                      </div>
                      <span className="text-sm font-black text-slate-800 tracking-tight">{invoice.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                      <Store size={14} className="text-slate-300" /> {invoice.establishment || 'Geral'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                      <Calendar size={14} /> {invoice.date}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit font-bold text-[10px] uppercase tracking-tighter">
                      {getCategoryIcon(invoice.category as string)} {invoice.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-slate-800">
                    {invoice.amount.toLocaleString('pt-PT')}{currencySymbol}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <FileText size={48} />
                      <p className="font-bold uppercase tracking-widest text-sm">Nenhuma fatura registada</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
