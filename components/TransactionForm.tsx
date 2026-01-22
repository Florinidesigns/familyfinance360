
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
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm mb-10 space-y-6">
      <div className="flex flex-wrap items-center gap-6">
        {/* Toggle Tipo */}
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button
            type="button"
            onClick={() => { setType('entrada'); setCategory(INCOME_SOURCES[0]); setHasInvoice(false); setIsNoNif(false); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'entrada' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {t.present.inflow}
          </button>
          <button
            type="button"
            onClick={() => { setType('saida'); setCategory(CATEGORIES[0]); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'saida' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {t.present.outflow}
          </button>
        </div>

        {/* Montante */}
        <div className="flex-1 min-w-[150px] relative">
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-slate-800 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300 placeholder:text-[10px]"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
        </div>

        {/* Categoria (Já virá ordenada A-Z por causa da constante) */}
        <select
          className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none cursor-pointer"
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          {type === 'entrada'
            ? INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)
            : CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)
          }
        </select>

        {/* Alimentação */}
        {type === 'saida' && category === 'Alimentação' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="relative group">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              {!isManualEstablishment ? (
                <select className="bg-emerald-50 border border-emerald-100 rounded-2xl pl-12 pr-6 py-4 font-bold text-emerald-700 focus:ring-4 focus:ring-emerald-500/10 outline-none cursor-pointer" value={establishment} onChange={(e) => setEstablishment(e.target.value)}>
                  {SUPERMARKETS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <input type="text" placeholder={t.present.establishmentPlaceholder} className="bg-emerald-50 border border-emerald-100 rounded-2xl pl-12 pr-6 py-4 font-bold text-emerald-700 focus:ring-4 focus:ring-emerald-500/10 outline-none" value={establishment} onChange={(e) => setEstablishment(e.target.value)} autoFocus />
              )}
            </div>
            <button type="button" onClick={() => { setIsManualEstablishment(!isManualEstablishment); setEstablishment(isManualEstablishment ? SUPERMARKETS[0] : ''); }} className={`p-4 rounded-2xl transition-all ${isManualEstablishment ? 'bg-slate-800 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}><Plus size={20} /></button>
          </div>
        )}

        {/* Habitação */}
        {type === 'saida' && category === 'Habitação' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="relative group">
              <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              {!isManualHabitacao ? (
                <select className="bg-orange-50 border border-orange-100 rounded-2xl pl-12 pr-6 py-4 font-bold text-orange-700 focus:ring-4 focus:ring-orange-500/10 outline-none cursor-pointer" value={habitacaoType} onChange={(e) => setHabitacaoType(e.target.value)}>
                  {HABITACAO_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              ) : (
                <input type="text" placeholder={t.present.typePlaceholder} className="bg-orange-50 border border-orange-100 rounded-2xl pl-12 pr-6 py-4 font-bold text-orange-700 focus:ring-4 focus:ring-orange-500/10 outline-none" value={habitacaoType} onChange={(e) => setHabitacaoType(e.target.value)} autoFocus />
              )}
            </div>
            <button type="button" onClick={() => { setIsManualHabitacao(!isManualHabitacao); setHabitacaoType(isManualHabitacao ? HABITACAO_TYPES[0] : ''); }} className={`p-4 rounded-2xl transition-all ${isManualHabitacao ? 'bg-slate-800 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}><Plus size={20} /></button>
          </div>
        )}

        {/* Transporte */}
        {type === 'saida' && category === 'Transporte' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="relative group">
              <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              {!isManualTransporte ? (
                <select className="bg-blue-50 border border-blue-100 rounded-2xl pl-12 pr-6 py-4 font-bold text-blue-700 focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer" value={transporteType} onChange={(e) => setTransporteType(e.target.value)}>
                  {TRANSPORTE_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              ) : (
                <input type="text" placeholder={t.present.typePlaceholder} className="bg-blue-50 border border-blue-100 rounded-2xl pl-12 pr-6 py-4 font-bold text-blue-700 focus:ring-4 focus:ring-blue-500/10 outline-none" value={transporteType} onChange={(e) => setTransporteType(e.target.value)} autoFocus />
              )}
            </div>
            <button type="button" onClick={() => { setIsManualTransporte(!isManualTransporte); setTransporteType(isManualTransporte ? TRANSPORTE_TYPES[0] : ''); }} className={`p-4 rounded-2xl transition-all ${isManualTransporte ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}><Plus size={20} /></button>
          </div>
        )}

        {/* Despesas */}
        {type === 'saida' && category === 'Despesas' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="relative group">
              <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              {!isManualDespesas ? (
                <select className="bg-emerald-50 border border-emerald-100 rounded-2xl pl-12 pr-6 py-4 font-bold text-emerald-700 focus:ring-4 focus:ring-emerald-500/10 outline-none cursor-pointer" value={despesasType} onChange={(e) => setDespesasType(e.target.value)}>
                  {DESPESAS_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              ) : (
                <input type="text" placeholder={t.present.typePlaceholder} className="bg-emerald-50 border border-emerald-100 rounded-2xl pl-12 pr-6 py-4 font-bold text-emerald-700 focus:ring-4 focus:ring-emerald-500/10 outline-none" value={despesasType} onChange={(e) => setDespesasType(e.target.value)} autoFocus />
              )}
            </div>
            <button type="button" onClick={() => { setIsManualDespesas(!isManualDespesas); setDespesasType(isManualDespesas ? DESPESAS_TYPES[0] : ''); }} className={`p-4 rounded-2xl transition-all ${isManualDespesas ? 'bg-slate-800 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}><Plus size={20} /></button>
          </div>
        )}

        {/* Animais */}
        {type === 'saida' && category === 'Animais' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="relative group">
              <PawPrint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              {!isManualAnimais ? (
                <select className="bg-violet-50 border border-violet-100 rounded-2xl pl-12 pr-6 py-4 font-bold text-violet-700 focus:ring-4 focus:ring-violet-500/10 outline-none cursor-pointer" value={animaisType} onChange={(e) => setAnimaisType(e.target.value)}>
                  {ANIMAIS_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              ) : (
                <input type="text" placeholder={t.present.typePlaceholder} className="bg-violet-50 border border-violet-100 rounded-2xl pl-12 pr-6 py-4 font-bold text-violet-700 focus:ring-4 focus:ring-violet-500/10 outline-none" value={animaisType} onChange={(e) => setAnimaisType(e.target.value)} autoFocus />
              )}
            </div>
            <button type="button" onClick={() => { setIsManualAnimais(!isManualAnimais); setAnimaisType(isManualAnimais ? ANIMAIS_TYPES[0] : ''); }} className={`p-4 rounded-2xl transition-all ${isManualAnimais ? 'bg-slate-800 text-white' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}><Plus size={20} /></button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <input type="text" placeholder={t.present.transactionDescription} className="flex-1 min-w-[200px] bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-medium text-slate-700 focus:ring-4 focus:ring-emerald-500/10 outline-none placeholder:text-[10px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        {type === 'saida' && (
          <div className="flex flex-wrap items-center gap-6 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" checked={hasInvoice} onChange={(e) => { setHasInvoice(e.target.checked); if (!e.target.checked) { setInvoiceNumber(''); setIsNoNif(false); } }} />
                <div className="w-12 h-7 bg-slate-200 rounded-full peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">{t.present.hasInvoice}</span>
            </label>
            {hasInvoice && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <input type="checkbox" id="no-nif-toggle" className="w-4 h-4 accent-rose-500" checked={isNoNif} onChange={(e) => { setIsNoNif(e.target.checked); if (e.target.checked) setInvoiceNumber(''); }} />
                  <label htmlFor="no-nif-toggle" className="text-[10px] font-black uppercase text-slate-500 cursor-pointer flex items-center gap-1"><UserMinus size={12} /> {t.present.noNif}</label>
                </div>
                {!isNoNif && (
                  <div className="relative min-w-[180px]">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={16} />
                    <input type="text" placeholder={t.present.invoiceNumber} className="w-full bg-white border border-emerald-100 rounded-2xl pl-10 pr-6 py-3 text-xs font-bold text-emerald-700 outline-none placeholder:text-[10px]" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} autoFocus />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <button type="submit" className="bg-slate-900 text-white p-4 px-8 rounded-[24px] hover:bg-slate-800 transition-all flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 ml-auto">
          <Check size={20} className="text-emerald-400" /> {t.present.add}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
