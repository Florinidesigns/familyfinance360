
import React, { useState } from 'react';
import { Plus, Check, ChevronLeft, Store, FileText, UserMinus, Home, Car, Zap, PawPrint } from 'lucide-react';
import { Transaction, Category, IncomeSource } from '../types';
import { CATEGORIES, INCOME_SOURCES, SUPERMARKETS, HABITACAO_TYPES, TRANSPORTE_TYPES, DESPESAS_TYPES, ANIMAIS_TYPES } from '../constants';

import { TranslationType } from '../translations';

interface Props {
  onAdd: (transaction: Transaction) => void;
  currencySymbol: string;
  t: TranslationType;
}

const TransactionForm: React.FC<Props> = ({ onAdd, currencySymbol, t }) => {
  const [type, setType] = useState<'entrada' | 'saida'>('saida');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | IncomeSource>(CATEGORIES[0]);
  const [description, setDescription] = useState('');

  // States para contextos detalhados
  const [establishment, setEstablishment] = useState(SUPERMARKETS[0]);
  const [isManualEstablishment, setIsManualEstablishment] = useState(false);

  const [habitacaoType, setHabitacaoType] = useState(HABITACAO_TYPES[0]);
  const [isManualHabitacao, setIsManualHabitacao] = useState(false);

  const [transporteType, setTransporteType] = useState(TRANSPORTE_TYPES[0]);
  const [isManualTransporte, setIsManualTransporte] = useState(false);

  const [despesasType, setDespesasType] = useState(DESPESAS_TYPES[0]);
  const [isManualDespesas, setIsManualDespesas] = useState(false);

  const [animaisType, setAnimaisType] = useState(ANIMAIS_TYPES[0]);
  const [isManualAnimais, setIsManualAnimais] = useState(false);

  const [hasInvoice, setHasInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isNoNif, setIsNoNif] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    let finalContextValue = undefined;
    if (type === 'saida') {
      if (category === 'Alimentação') finalContextValue = establishment;
      if (category === 'Habitação') finalContextValue = habitacaoType;
      if (category === 'Transporte') finalContextValue = transporteType;
      if (category === 'Despesas') finalContextValue = despesasType;
      if (category === 'Animais') finalContextValue = animaisType;
    }

    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      type,
      amount: Number(amount),
      category,
      description,
      establishment: finalContextValue,
      invoiceNumber: (type === 'saida' && hasInvoice && !isNoNif) ? invoiceNumber : undefined,
      isNoNif: type === 'saida' ? isNoNif : false,
      date: new Date().toISOString().split('T')[0]
    });

    setAmount('');
    setDescription('');
    setEstablishment(SUPERMARKETS[0]);
    setHabitacaoType(HABITACAO_TYPES[0]);
    setTransporteType(TRANSPORTE_TYPES[0]);
    setDespesasType(DESPESAS_TYPES[0]);
    setAnimaisType(ANIMAIS_TYPES[0]);
    setIsManualEstablishment(false);
    setIsManualHabitacao(false);
    setIsManualTransporte(false);
    setIsManualDespesas(false);
    setIsManualAnimais(false);
    setHasInvoice(false);
    setInvoiceNumber('');
    setIsNoNif(false);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val as any);
    if (val === 'Alimentação') { setEstablishment(SUPERMARKETS[0]); setIsManualEstablishment(false); }
    if (val === 'Habitação') { setHabitacaoType(HABITACAO_TYPES[0]); setIsManualHabitacao(false); }
    if (val === 'Transporte') { setTransporteType(TRANSPORTE_TYPES[0]); setIsManualTransporte(false); }
    if (val === 'Despesas') { setDespesasType(DESPESAS_TYPES[0]); setIsManualDespesas(false); }
    if (val === 'Animais') { setAnimaisType(ANIMAIS_TYPES[0]); setIsManualAnimais(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-2 md:p-8 rounded-[20px] md:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm mb-3 md:mb-10 space-y-2 md:space-y-6 transition-colors duration-300">
      <div className="flex flex-wrap items-center gap-2 md:gap-6">
        {/* Toggle Tipo */}
        <div className="flex bg-slate-50 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={() => { setType('entrada'); setCategory(INCOME_SOURCES[0]); setHasInvoice(false); setIsNoNif(false); }}
            className={`px-3 md:px-6 py-1.5 md:py-2.5 rounded-md text-[9px] md:text-xs font-black uppercase tracking-wider transition-all ${type === 'entrada' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-none' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
          >
            {t.present.inflow}
          </button>
          <button
            type="button"
            onClick={() => { setType('saida'); setCategory(CATEGORIES[0]); }}
            className={`px-3 md:px-6 py-1.5 md:py-2.5 rounded-md text-[9px] md:text-xs font-black uppercase tracking-wider transition-all ${type === 'saida' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100 dark:shadow-none' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
          >
            {t.present.outflow}
          </button>
        </div>

        {/* Montante */}
        <div className="flex-1 min-w-[120px] relative">
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 md:px-6 py-2 md:py-4 text-base md:text-xl font-black text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:text-[10px]"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <span className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-sm">{currencySymbol}</span>
        </div>

        {/* Categoria (Já virá ordenada A-Z por causa da constante) */}
        <select
          className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 md:px-6 py-2 md:py-4 font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/10 outline-none appearance-none cursor-pointer text-xs md:text-base"
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          {type === 'entrada'
            ? INCOME_SOURCES.map(s => <option key={s} value={s} className="dark:bg-slate-900">{s}</option>)
            : CATEGORIES.map(c => <option key={c} value={c} className="dark:bg-slate-900">{c}</option>)
          }
        </select>

        {/* Alimentação */}
        {type === 'saida' && category === 'Alimentação' && (
          <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="relative group">
              <Store className="absolute left-2.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
              {!isManualEstablishment ? (
                <select className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800 rounded-xl pl-9 md:pl-12 pr-3 md:pr-6 py-2 md:py-4 font-bold text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/10 outline-none cursor-pointer text-xs md:text-base" value={establishment} onChange={(e) => setEstablishment(e.target.value)}>
                  {SUPERMARKETS.map(s => <option key={s} value={s} className="dark:bg-slate-900">{s}</option>)}
                </select>
              ) : (
                <input type="text" placeholder={t.present.establishmentPlaceholder} className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800 rounded-xl pl-9 md:pl-12 pr-3 md:pr-6 py-2 md:py-4 font-bold text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/10 outline-none text-xs md:text-base" value={establishment} onChange={(e) => setEstablishment(e.target.value)} autoFocus />
              )}
            </div>
            <button type="button" onClick={() => { setIsManualEstablishment(!isManualEstablishment); setEstablishment(isManualEstablishment ? SUPERMARKETS[0] : ''); }} className={`p-2 md:p-4 rounded-xl transition-all ${isManualEstablishment ? 'bg-slate-800 dark:bg-slate-700 text-white' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800'}`}><Plus size={16} /></button>
          </div>
        )}

        {/* Habitação */}
        {type === 'saida' && category === 'Habitação' && (
          <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="relative group">
              <Home className="absolute left-2.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              {!isManualHabitacao ? (
                <select className="bg-orange-50 border border-orange-100 rounded-xl pl-9 md:pl-12 pr-3 md:pr-6 py-2 md:py-4 font-bold text-orange-700 focus:ring-2 focus:ring-orange-500/10 outline-none cursor-pointer text-xs md:text-base" value={habitacaoType} onChange={(e) => setHabitacaoType(e.target.value)}>
                  {HABITACAO_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              ) : (
                <input type="text" placeholder={t.present.typePlaceholder} className="bg-orange-50 border border-orange-100 rounded-xl pl-9 md:pl-12 pr-3 md:pr-6 py-2 md:py-4 font-bold text-orange-700 focus:ring-2 focus:ring-orange-500/10 outline-none text-xs md:text-base" value={habitacaoType} onChange={(e) => setHabitacaoType(e.target.value)} autoFocus />
              )}
            </div>
            <button type="button" onClick={() => { setIsManualHabitacao(!isManualHabitacao); setHabitacaoType(isManualHabitacao ? HABITACAO_TYPES[0] : ''); }} className={`p-2 md:p-4 rounded-xl transition-all ${isManualHabitacao ? 'bg-slate-800 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}><Plus size={16} /></button>
          </div>
        )}

        {/* Transporte */}
        {type === 'saida' && category === 'Transporte' && (
          <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="relative group">
              <Car className="absolute left-2.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              {!isManualTransporte ? (
                <select className="bg-blue-50 border border-blue-100 rounded-xl pl-9 md:pl-12 pr-3 md:pr-6 py-2 md:py-4 font-bold text-blue-700 focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer text-xs md:text-base" value={transporteType} onChange={(e) => setTransporteType(e.target.value)}>
                  {TRANSPORTE_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              ) : (
                <input type="text" placeholder={t.present.typePlaceholder} className="bg-blue-50 border border-blue-100 rounded-xl pl-9 md:pl-12 pr-3 md:pr-6 py-2 md:py-4 font-bold text-blue-700 focus:ring-2 focus:ring-blue-500/10 outline-none text-xs md:text-base" value={transporteType} onChange={(e) => setTransporteType(e.target.value)} autoFocus />
              )}
            </div>
            <button type="button" onClick={() => { setIsManualTransporte(!isManualTransporte); setTransporteType(isManualTransporte ? TRANSPORTE_TYPES[0] : ''); }} className={`p-2 md:p-4 rounded-xl transition-all ${isManualTransporte ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}><Plus size={16} /></button>
          </div>
        )}

        {/* Despesas */}
        {type === 'saida' && category === 'Despesas' && (
          <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="relative group">
              <Zap className="absolute left-2.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              {!isManualDespesas ? (
                <select className="bg-emerald-50 border border-emerald-100 rounded-xl pl-9 md:pl-12 pr-3 md:pr-6 py-2 md:py-4 font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500/10 outline-none cursor-pointer text-xs md:text-base" value={despesasType} onChange={(e) => setDespesasType(e.target.value)}>
                  {DESPESAS_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              ) : (
                <input type="text" placeholder={t.present.typePlaceholder} className="bg-emerald-50 border border-emerald-100 rounded-xl pl-9 md:pl-12 pr-3 md:pr-6 py-2 md:py-4 font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500/10 outline-none text-xs md:text-base" value={despesasType} onChange={(e) => setDespesasType(e.target.value)} autoFocus />
              )}
            </div>
            <button type="button" onClick={() => { setIsManualDespesas(!isManualDespesas); setDespesasType(isManualDespesas ? DESPESAS_TYPES[0] : ''); }} className={`p-2 md:p-4 rounded-xl transition-all ${isManualDespesas ? 'bg-slate-800 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}><Plus size={16} /></button>
          </div>
        )}

        {/* Animais */}
        {type === 'saida' && category === 'Animais' && (
          <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="relative group">
              <PawPrint className="absolute left-2.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              {!isManualAnimais ? (
                <select className="bg-violet-50 border border-violet-100 rounded-xl pl-9 md:pl-12 pr-3 md:pr-6 py-2 md:py-4 font-bold text-violet-700 focus:ring-2 focus:ring-violet-500/10 outline-none cursor-pointer text-xs md:text-base" value={animaisType} onChange={(e) => setAnimaisType(e.target.value)}>
                  {ANIMAIS_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              ) : (
                <input type="text" placeholder={t.present.typePlaceholder} className="bg-violet-50 border border-violet-100 rounded-xl pl-9 md:pl-12 pr-3 md:pr-6 py-2 md:py-4 font-bold text-violet-700 focus:ring-2 focus:ring-violet-500/10 outline-none text-xs md:text-base" value={animaisType} onChange={(e) => setAnimaisType(e.target.value)} autoFocus />
              )}
            </div>
            <button type="button" onClick={() => { setIsManualAnimais(!isManualAnimais); setAnimaisType(isManualAnimais ? ANIMAIS_TYPES[0] : ''); }} className={`p-2 md:p-4 rounded-xl transition-all ${isManualAnimais ? 'bg-slate-800 text-white' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}><Plus size={16} /></button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-6">
        <input type="text" placeholder={t.present.transactionDescription} className="flex-1 min-w-[150px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 md:px-6 py-2 md:py-4 font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/10 outline-none placeholder:text-[10px] dark:placeholder:text-slate-600 sm:text-sm text-xs" value={description} onChange={(e) => setDescription(e.target.value)} />
        {type === 'saida' && (
          <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-2 md:p-4 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" checked={hasInvoice} onChange={(e) => { setHasInvoice(e.target.checked); if (!e.target.checked) { setInvoiceNumber(''); setIsNoNif(false); } }} />
                <div className="w-10 h-6 md:w-12 md:h-7 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] md:after:h-5 md:after:w-5 after:transition-all peer-checked:after:translate-x-4 md:peer-checked:after:translate-x-full"></div>
              </div>
              <span className="text-[9px] md:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{t.present.hasInvoice}</span>
            </label>
            {hasInvoice && (
              <div className="flex items-center gap-2 md:gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="flex items-center gap-1.5 px-2 md:px-4 py-1.5 md:py-2 bg-white dark:bg-slate-900 rounded-lg md:rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <input type="checkbox" id="no-nif-toggle" className="w-3 h-3 md:w-4 md:h-4 accent-rose-500" checked={isNoNif} onChange={(e) => { setIsNoNif(e.target.checked); if (e.target.checked) setInvoiceNumber(''); }} />
                  <label htmlFor="no-nif-toggle" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 cursor-pointer flex items-center gap-1"><UserMinus size={10} className="md:hidden" /><UserMinus size={12} className="hidden md:block" /> {t.present.noNif}</label>
                </div>
                {!isNoNif && (
                  <div className="relative min-w-[140px] md:min-w-[180px]">
                    <FileText className="absolute left-2.5 md:left-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" size={14} />
                    <input type="text" placeholder={t.present.invoiceNumber} className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-800 rounded-xl md:rounded-2xl pl-8 md:pl-10 pr-3 md:pr-6 py-2 md:py-3 text-[10px] md:text-xs font-bold text-emerald-700 dark:text-emerald-400 outline-none placeholder:text-[9px] md:placeholder:text-[10px]" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} autoFocus />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <button type="submit" className="bg-slate-900 dark:bg-emerald-600 text-white p-2 md:p-4 px-4 md:px-8 rounded-xl md:rounded-[24px] hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all flex items-center gap-1.5 md:gap-3 font-black text-[9px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] shadow-lg dark:shadow-none active:scale-95 ml-auto">
          <Check size={14} className="text-emerald-400" /> {t.present.add}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
