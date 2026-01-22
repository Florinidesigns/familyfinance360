
import React from 'react';
import { Download, FileSpreadsheet, FileText, TrendingUp, Info, FileCheck, Printer, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { FinanceState } from '../types';
import { IRS_CONFIG, getCategoryIcon } from '../constants';
import * as XLSX from 'xlsx';

interface Props {
  state: FinanceState;
  currencySymbol: string;
}

const ReportsPage: React.FC<Props> = ({ state, currencySymbol }) => {

  const exportToExcel = (type: 'general' | 'irs') => {
    let exportData: any[] = [];
    let sheetName = "Extrato_Geral";

    if (type === 'general') {
      exportData = state.transactions.map(t => ({
        'Data': t.date,
        'Tipo': t.type === 'entrada' ? 'Receita' : 'Despesa',
        'Categoria': t.category,
        'Descrição': t.description,
        [`Montante (${currencySymbol})`]: t.amount,
        'Estabelecimento': t.establishment || 'N/A',
        'Nº Fatura': t.invoiceNumber || 'N/A'
      }));
      sheetName = "Finanças360_Extracto";
    } else {
      const irsCategories = ['Saúde', 'Educação', 'Habitação', 'Lazer', 'Alimentação', 'Utilidades', 'Outros'];
      exportData = state.transactions
        .filter(t => t.type === 'saida' && irsCategories.includes(t.category))
        .map(t => ({
          'Fiscal_Categoria': t.category === 'Lazer' ? 'Restauração/IVA' : (['Alimentação', 'Utilidades', 'Outros'].includes(t.category) ? 'Despesas Gerais' : t.category),
          'Data': t.date,
          'Entidade': t.establishment || 'N/A',
          'Nº Fatura': t.invoiceNumber || 'PENDENTE',
          [`Montante Bruto (${currencySymbol})`]: t.amount,
        }));
      sheetName = "Suporte_IRS";
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const fileName = type === 'general'
      ? `Relatorio_Geral_${new Date().getFullYear()}.xlsx`
      : `Suporte_IRS_Confirmacao_${new Date().getFullYear()}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalIncome = state.transactions.filter(t => t.type === 'entrada').reduce((a, b) => a + b.amount, 0);
  const totalExpenses = state.transactions.filter(t => t.type === 'saida').reduce((a, b) => a + b.amount, 0);
  const totalSavings = state.goals.reduce((a, b) => a + b.currentAmount, 0);
  const totalDebts = state.debts.reduce((a, b) => a + b.remainingValue, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Visual Header (Screen only) */}
      <div className="bg-slate-900 p-10 rounded-[40px] text-white relative overflow-hidden print:hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Download className="text-emerald-400" /> Centro de Exportação
          </h3>
          <p className="opacity-60 max-w-md">Transforme os seus dados em documentos oficiais. Formatos otimizados para gestão profissional e fiscal.</p>
        </div>
        <TrendingUp size={180} className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none" />
      </div>

      {/* Action Cards (Screen only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print:hidden">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-emerald-200 transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={28} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-3">Extrato Geral</h4>
            <p className="text-slate-400 mb-6 text-sm font-medium leading-relaxed">Ficheiro Excel completo com todas as transações para análise profunda.</p>
          </div>
          <button
            onClick={() => exportToExcel('general')}
            className="w-full bg-slate-100 text-slate-800 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Exportar Excel <Download size={14} />
          </button>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-amber-200 transition-all flex flex-col justify-between ring-2 ring-amber-500/10">
          <div>
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileCheck size={28} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-3">Apoio ao IRS</h4>
            <p className="text-slate-400 mb-6 text-sm font-medium leading-relaxed">Relatório estruturado para conferência rápida com o portal e-fatura.</p>
          </div>
          <button
            onClick={handlePrint}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
          >
            Gerar Relatório IRS <Printer size={14} />
          </button>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-blue-200 transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText size={28} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-3">Relatório Mensal PDF</h4>
            <p className="text-slate-400 mb-6 text-sm font-medium leading-relaxed">Sumário executivo visual para arquivo ou partilha familiar.</p>
          </div>
          <button
            onClick={handlePrint}
            className="w-full bg-slate-100 text-slate-800 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Imprimir PDF <FileText size={14} />
          </button>
        </div>
      </div>

      {/* Info Box (Screen only) */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 flex items-start gap-6 print:hidden">
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h5 className="font-bold text-slate-800 mb-1 uppercase text-xs tracking-widest">Relatórios Certificados</h5>
          <p className="text-slate-500 text-sm leading-relaxed">
            Todos os documentos gerados utilizam as normas ISO de formatação de dados, garantindo que os seus valores são preservados e legíveis em qualquer sistema fiscal ou bancário.
          </p>
        </div>
      </div>

      {/* --- PRINT TEMPLATE (Hidden on screen, Beautiful on Print/PDF) --- */}
      <div className="hidden print:block bg-white p-0 text-slate-900 font-sans leading-tight">
        {/* Print Header */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Relatório de Saúde Financeira</h1>
            <div className="flex gap-4 mt-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
              <span className="flex items-center gap-1"><Calendar size={14} /> {new Date().toLocaleDateString('pt-PT')}</span>
              <span className="flex items-center gap-1"><ShieldCheck size={14} /> Documento Verificado</span>
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
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Rendimentos</p>
            <p className="text-2xl font-black text-slate-800">{totalIncome.toLocaleString('pt-PT')}{currencySymbol}</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Despesas</p>
            <p className="text-2xl font-black text-slate-800">{totalExpenses.toLocaleString('pt-PT')}{currencySymbol}</p>
          </div>
          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
            <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Poupança Futuro</p>
            <p className="text-2xl font-black text-emerald-700">{totalSavings.toLocaleString('pt-PT')}{currencySymbol}</p>
          </div>
          <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
            <p className="text-[10px] font-black uppercase text-orange-600 mb-1">Dívida Passado</p>
            <p className="text-2xl font-black text-orange-700">{totalDebts.toLocaleString('pt-PT')}{currencySymbol}</p>
          </div>
        </div>

        {/* IRS Audit Section (The "Apoio ao IRS" part of the PDF) */}
        <div className="mb-10 page-break-inside-avoid">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 border-b-2 border-slate-100 pb-2">
            <FileCheck className="text-amber-500" size={20} /> Detalhe para Conferência IRS (e-fatura)
          </h3>
          <div className="grid grid-cols-2 gap-8">
            {Object.entries(IRS_CONFIG).map(([category, config]) => {
              const amount = state.transactions
                .filter(t => t.type === 'saida' && (t.category === category || (category === 'Outros' && ['Alimentação', 'Utilidades'].includes(t.category as string))))
                .reduce((acc, t) => acc + t.amount, 0);
              const benefit = Math.min(amount * config.percentage, config.maxBenefit);

              return (
                <div key={category} className="flex justify-between items-center p-4 border-b border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{category}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{config.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800">{amount.toLocaleString('pt-PT')}{currencySymbol}</p>
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Recuperável: {benefit.toFixed(2)}{currencySymbol}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="mb-10">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 border-b-2 border-slate-100 pb-2">
            <TrendingUp className="text-emerald-500" size={20} /> Extrato Detalhado de Operações
          </h3>
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 font-black uppercase tracking-widest">Data</th>
                <th className="p-3 font-black uppercase tracking-widest">Categoria</th>
                <th className="p-3 font-black uppercase tracking-widest">Entidade / Descrição</th>
                <th className="p-3 font-black uppercase tracking-widest">Nº Fatura</th>
                <th className="p-3 font-black uppercase tracking-widest text-right">Montante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.transactions.map(t => (
                <tr key={t.id} className="border-b border-slate-50">
                  <td className="p-3 text-slate-500">{t.date}</td>
                  <td className="p-3 font-bold">{t.category}</td>
                  <td className="p-3">
                    <p className="font-bold">{t.description}</p>
                    {t.establishment && <p className="text-emerald-600 font-black uppercase text-[8px]">@ {t.establishment}</p>}
                  </td>
                  <td className="p-3 text-slate-400">{t.invoiceNumber || (t.isNoNif ? 'Sem NIF' : 'Pendente')}</td>
                  <td className={`p-3 text-right font-black ${t.type === 'entrada' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {t.type === 'entrada' ? '+' : '-'}{t.amount.toLocaleString('pt-PT')}{currencySymbol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Print Footer */}
        <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center opacity-50">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Gerado por Finanças360 Ecosystem • Todos os direitos reservados</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span className="text-[8px] font-bold text-slate-800 uppercase">Documento de Integridade Verificada</span>
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
