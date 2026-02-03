import React from 'react';
import { Download, FileSpreadsheet, FileText, TrendingUp, Info, FileCheck, Printer, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { FinanceState } from '../types';
import { IRS_CONFIG, getCategoryIcon } from '../constants';
import * as XLSX from 'xlsx';
import { TranslationType } from '../translations';

interface Props {
  state: FinanceState;
  currencySymbol: string;
  t: TranslationType;
  language: string;
  locale: string;
}

const ReportsPage: React.FC<Props> = ({ state, currencySymbol, t, language, locale }) => {

  const exportToExcel = (type: 'general' | 'irs') => {
    let exportData: any[] = [];
    let sheetName = t.reports.excel.generalSheet;

    if (type === 'general') {
      exportData = (state.transactions || []).map(tData => ({
        [t.present.date]: tData.date,
        [t.reports.excel.type]: tData.type === 'entrada' ? t.reports.excel.income : t.reports.excel.expense,
        [t.present.category]: t.categories[tData.category as keyof typeof t.categories] || tData.category,
        [t.present.description]: tData.description,
        [`${t.present.amount} (${currencySymbol})`]: tData.amount,
        [t.reports.excel.establishment]: tData.establishment || 'N/A',
        [t.reports.excel.invoiceNumber]: tData.invoiceNumber || 'N/A'
      }));
      sheetName = t.reports.excel.generalSheet;
    } else {
      const irsCategories = ['Saúde', 'Educação', 'Habitação', 'Lazer', 'Alimentação', 'Utilidades', 'Outros'];
      exportData = (state.transactions || [])
        .filter(tData => tData.type === 'saida' && irsCategories.includes(tData.category))
        .map(tData => ({
          [t.reports.excel.fiscalCategory]: tData.category === 'Lazer' ? (language === 'Português' ? 'Restauração/IVA' : 'Restoration/VAT') : (['Alimentação', 'Utilidades', 'Outros'].includes(tData.category) ? (language === 'Português' ? 'Despesas Gerais' : 'General Expenses') : tData.category),
          [t.present.date]: tData.date,
          [t.reports.excel.entity]: tData.establishment || 'N/A',
          [t.reports.excel.invoiceNumber]: tData.invoiceNumber || t.reports.excel.pending,
          [`${t.present.amount} ${t.reports.excel.grossAmount} (${currencySymbol})`]: tData.amount,
        }));
      sheetName = t.reports.excel.irsSheet;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const fileName = type === 'general'
      ? `${language === 'Português' ? 'Relatorio_Geral' : language === 'Español' ? 'Informe_General' : 'General_Report'}_${new Date().getFullYear()}.xlsx`
      : `${language === 'Português' ? 'Suporte_IRS_Confirmacao' : 'Income_Tax_Support'}_${new Date().getFullYear()}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalIncome = (state.transactions || []).filter(t => t.type === 'entrada').reduce((a, b) => a + Number(b.amount), 0);
  const totalExpenses = (state.transactions || []).filter(t => t.type === 'saida').reduce((a, b) => a + Number(b.amount), 0);
  const totalSavings = (state.goals || []).reduce((a, b) => a + Number(b.currentAmount), 0);
  const totalDebts = (state.debts || []).reduce((a, b) => a + Number(b.remainingValue), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 transition-colors duration-300">
      {/* Visual Header (Screen only) */}
      <div className="bg-slate-900 dark:bg-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden print:hidden border border-slate-800">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Download className="text-emerald-400" /> {t.reports.title}
          </h3>
          <p className="opacity-60 dark:opacity-50 max-w-md">{t.reports.subtitle}</p>
        </div>
        <TrendingUp size={180} className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none" />
      </div>

      {/* Action Cards (Screen only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print:hidden">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={28} />
            </div>
            <h4 className="text-xl font-black text-slate-800 dark:text-white mb-3">{t.reports.generalExtract}</h4>
            <p className="text-slate-400 dark:text-slate-500 mb-6 text-sm font-medium leading-relaxed">{t.reports.generalExtractDesc}</p>
          </div>
          <button
            onClick={() => exportToExcel('general')}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {t.reports.exportExcel} <Download size={14} />
          </button>
        </div>

        {language === 'Português' && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-amber-200 dark:hover:border-amber-800 transition-all flex flex-col justify-between ring-2 ring-amber-500/10 dark:ring-amber-500/5">
            <div>
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileCheck size={28} />
              </div>
              <h4 className="text-xl font-black text-slate-800 dark:text-white mb-3">{t.reports.irsSupport}</h4>
              <p className="text-slate-400 dark:text-slate-500 mb-6 text-sm font-medium leading-relaxed">{t.reports.irsSupportDesc}</p>
            </div>
            <button
              onClick={handlePrint}
              className="w-full bg-slate-900 dark:bg-amber-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 dark:hover:bg-amber-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg dark:shadow-none"
            >
              {t.reports.generateIrsReport} <Printer size={14} />
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-blue-200 dark:hover:border-blue-800 transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText size={28} />
            </div>
            <h4 className="text-xl font-black text-slate-800 dark:text-white mb-3">{t.reports.monthlyReportPdf}</h4>
            <p className="text-slate-400 dark:text-slate-500 mb-6 text-sm font-medium leading-relaxed">{t.reports.monthlyReportDesc}</p>
          </div>
          <button
            onClick={handlePrint}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {t.reports.printPdf} <FileText size={14} />
          </button>
        </div>
      </div>

      {/* Info Box (Screen only) */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 flex items-start gap-6 print:hidden transition-colors duration-300">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h5 className="font-bold text-slate-800 dark:text-slate-100 mb-1 uppercase text-xs tracking-widest">{t.reports.certifiedReports}</h5>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {t.reports.certifiedReportsDesc}
          </p>
        </div>
      </div>

      {/* --- PRINT TEMPLATE (Hidden on screen, Beautiful on Print/PDF) --- */}
      <div className="hidden print:block bg-white p-0 text-slate-900 font-sans leading-tight">
        {/* Print Header */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{t.reports.financialHealthReport}</h1>
            <div className="flex gap-4 mt-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
              <span className="flex items-center gap-1"><Calendar size={14} /> {new Date().toLocaleDateString(locale)}</span>
              <span className="flex items-center gap-1"><ShieldCheck size={14} /> {t.reports.verifiedDocument}</span>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-emerald-600 leading-none">Finanças360</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Past • Present • Future</p>
          </div>
        </div>

        {/* Print Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.reports.income}</p>
            <p className="text-2xl font-black text-slate-800">{totalIncome.toLocaleString(locale)}{currencySymbol}</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{t.reports.expenses}</p>
            <p className="text-2xl font-black text-slate-800">{totalExpenses.toLocaleString(locale)}{currencySymbol}</p>
          </div>
          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
            <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">{t.reports.futureSavings}</p>
            <p className="text-2xl font-black text-emerald-700">{totalSavings.toLocaleString(locale)}{currencySymbol}</p>
          </div>
          <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
            <p className="text-[10px] font-black uppercase text-orange-600 mb-1">{t.reports.pastDebt}</p>
            <p className="text-2xl font-black text-orange-700">{totalDebts.toLocaleString(locale)}{currencySymbol}</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="mb-10">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 border-b-2 border-slate-100 pb-2">
            <TrendingUp className="text-emerald-500" size={20} /> {t.reports.detailedExtract}
          </h3>
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 font-black uppercase tracking-widest">{t.present.date}</th>
                <th className="p-3 font-black uppercase tracking-widest">{t.present.category}</th>
                <th className="p-3 font-black uppercase tracking-widest">{t.reports.entityDescription}</th>
                <th className="p-3 font-black uppercase tracking-widest">{t.reports.excel.invoiceNumber}</th>
                <th className="p-3 font-black uppercase tracking-widest text-right">{t.present.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(state.transactions || []).map(tx => (
                <tr key={tx.id} className="border-b border-slate-50">
                  <td className="p-3 text-slate-500">{tx.date}</td>
                  <td className="p-3 font-bold">{tx.category}</td>
                  <td className="p-3">
                    <p className="font-bold">{tx.description}</p>
                    {tx.establishment && <p className="text-emerald-600 font-black uppercase text-[8px]">@ {tx.establishment}</p>}
                  </td>
                  <td className="p-3 text-slate-400">{tx.invoiceNumber || (tx.isNoNif ? t.reports.excel.noNif : t.reports.excel.pending)}</td>
                  <td className={`p-3 text-right font-black ${tx.type === 'entrada' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {tx.type === 'entrada' ? '+' : '-'}{Number(tx.amount).toLocaleString(locale)}{currencySymbol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* IRS Audit Section (The "Apoio ao IRS" part of the PDF) */}
        <div className="mb-10 page-break-inside-avoid">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 border-b-2 border-slate-100 pb-2">
            <FileCheck className="text-amber-500" size={20} /> {t.reports.irsAuditDetail}
          </h3>
          <div className="grid grid-cols-2 gap-8">
            {Object.entries(IRS_CONFIG).map(([category, config]) => {
              const amount = (state.transactions || [])
                .filter(t => t.type === 'saida' && (t.category === category || (category === 'Outros' && ['Alimentação', 'Utilidades', 'Despesas'].includes(t.category as string))))
                .reduce((acc, t) => acc + Number(t.amount), 0);
              const benefit = Math.min(amount * config.percentage, config.maxBenefit);

              return (
                <div key={category} className="flex justify-between items-center p-4 border-b border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{category}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{config.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800">{amount.toLocaleString(locale)}{currencySymbol}</p>
                    <p className="text-[10px] font-black text-emerald-600 uppercase">{t.reports.recoverable}: {benefit.toFixed(2)}{currencySymbol}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Print Footer */}
        <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center opacity-50">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">{t.reports.footerText}</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span className="text-[8px] font-bold text-slate-800 uppercase">{t.reports.integrityVerified}</span>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 1.5cm;
            size: A4;
          }
          body {
            background: white !important;
            color: black !important;
          }
          /* Esconder elementos da UI na impressão */
          nav, aside, button, .print\\:hidden {
            display: none !important;
          }
          /* Garantir que o container de impressão ocupe tudo */
          .print\\:block {
            display: block !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
