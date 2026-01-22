
import React, { useState, useEffect } from 'react';
import { X, Check, Store, FileText, ChevronLeft, Plus, Trash2, UserMinus, Home, Car, Zap, PawPrint } from 'lucide-react';
import { Transaction, Category, IncomeSource } from '../types';
import { CATEGORIES, INCOME_SOURCES, SUPERMARKETS, HABITACAO_TYPES, TRANSPORTE_TYPES, DESPESAS_TYPES, ANIMAIS_TYPES } from '../constants';

interface Props {
  transaction: Transaction;
  onSave: (updated: Transaction) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  currencySymbol: string;
}

const EditTransactionModal: React.FC<Props> = ({ transaction, onSave, onDelete, onClose, currencySymbol }) => {
  const [type, setType] = useState<'entrada' | 'saida'>(transaction.type);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState<Category | IncomeSource>(transaction.category);
  const [description, setDescription] = useState(transaction.description);

  const [establishment, setEstablishment] = useState(transaction.establishment || SUPERMARKETS[0]);
  const [habitacaoType, setHabitacaoType] = useState(transaction.establishment || HABITACAO_TYPES[0]);
  const [transporteType, setTransporteType] = useState(transaction.establishment || TRANSPORTE_TYPES[0]);
  const [despesasType, setDespesasType] = useState(transaction.establishment || DESPESAS_TYPES[0]);
  const [animaisType, setAnimaisType] = useState(transaction.establishment || ANIMAIS_TYPES[0]);

  const [isManualContext, setIsManualContext] = useState(
    transaction.establishment
      ? (
        transaction.category === 'Alimentação' ? !SUPERMARKETS.includes(transaction.establishment) :
          transaction.category === 'Habitação' ? !HABITACAO_TYPES.includes(transaction.establishment) :
            transaction.category === 'Transporte' ? !TRANSPORTE_TYPES.includes(transaction.establishment) :
              transaction.category === 'Despesas' ? !DESPESAS_TYPES.includes(transaction.establishment) :
                transaction.category === 'Animais' ? !ANIMAIS_TYPES.includes(transaction.establishment) : false
      )
      : false
  );

  const [hasInvoice, setHasInvoice] = useState(!!transaction.invoiceNumber || transaction.isNoNif);
  const [invoiceNumber, setInvoiceNumber] = useState(transaction.invoiceNumber || '');
  const [isNoNif, setIsNoNif] = useState(transaction.isNoNif || false);

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

    onSave({
      ...transaction,
      type,
      amount: Number(amount),
      category,
      description,
      establishment: finalContextValue,
      invoiceNumber: (type === 'saida' && hasInvoice && !isNoNif && invoiceNumber.trim() !== '') ? invoiceNumber : undefined,
      isNoNif: type === 'saida' ? isNoNif : false,
    });
  };

  const handleInvoiceToggle = (checked: boolean) => {
    setHasInvoice(checked);
    if (!checked) { setInvoiceNumber(''); setIsNoNif(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div><h3 className="text-2xl font-black text-slate-800">Editar Transação</h3><p className="text-slate-400 text-sm font-medium">Ajuste os detalhes do seu registo.</p></div>
          <button type="button" onClick={onClose} className="p-4 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-rose-600 shadow-sm"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              <button type="button" onClick={() => { setType('entrada'); setCategory(INCOME_SOURCES[0]); handleInvoiceToggle(false); }} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'entrada' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Entrada</button>
              <button type="button" onClick={() => { setType('saida'); setCategory(CATEGORIES[0]); }} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'saida' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Saída</button>
            </div>
            <div className="flex-1 min-w-[150px] relative">
              <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-slate-800 outline-none" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currencySymbol}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Categoria</label>
              <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none" value={category} onChange={(e) => setCategory(e.target.value as any)}>
                {type === 'entrada' ? INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>) : CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Descrição</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-medium text-slate-700 outline-none" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          {type === 'saida' && category === 'Alimentação' && (
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Estabelecimento</label>
              <div className="flex items-center gap-2">
                {!isManualContext ? <select className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 font-bold text-emerald-700 outline-none" value={establishment} onChange={(e) => setEstablishment(e.target.value)}>{SUPERMARKETS.map(s => <option key={s} value={s}>{s}</option>)}</select> : <input type="text" className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 font-bold text-emerald-700 outline-none" value={establishment} onChange={(e) => setEstablishment(e.target.value)} />}
                <button type="button" onClick={() => setIsManualContext(!isManualContext)} className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl"><Plus size={20} /></button>
              </div>
            </div>
          )}

          {type === 'saida' && category === 'Habitação' && (
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sub-Categoria Habitação</label>
              <div className="flex items-center gap-2">
                {!isManualContext ? <select className="flex-1 bg-orange-50 border border-orange-100 rounded-2xl px-6 py-4 font-bold text-orange-700 outline-none" value={habitacaoType} onChange={(e) => setHabitacaoType(e.target.value)}>{HABITACAO_TYPES.map(h => <option key={h} value={h}>{h}</option>)}</select> : <input type="text" className="flex-1 bg-orange-50 border border-orange-100 rounded-2xl px-6 py-4 font-bold text-orange-700 outline-none" value={habitacaoType} onChange={(e) => setHabitacaoType(e.target.value)} />}
                <button type="button" onClick={() => setIsManualContext(!isManualContext)} className="p-4 bg-orange-100 text-orange-700 rounded-2xl"><Plus size={20} /></button>
              </div>
            </div>
          )}

          {type === 'saida' && category === 'Transporte' && (
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sub-Categoria Transporte</label>
              <div className="flex items-center gap-2">
                {!isManualContext ? <select className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 font-bold text-blue-700 outline-none" value={transporteType} onChange={(e) => setTransporteType(e.target.value)}>{TRANSPORTE_TYPES.map(h => <option key={h} value={h}>{h}</option>)}</select> : <input type="text" className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 font-bold text-blue-700 outline-none" value={transporteType} onChange={(e) => setTransporteType(e.target.value)} />}
                <button type="button" onClick={() => setIsManualContext(!isManualContext)} className="p-4 bg-blue-100 text-blue-700 rounded-2xl"><Plus size={20} /></button>
              </div>
            </div>
          )}

          {type === 'saida' && category === 'Despesas' && (
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sub-Categoria Despesa</label>
              <div className="flex items-center gap-2">
                {!isManualContext ? <select className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 font-bold text-emerald-700 outline-none" value={despesasType} onChange={(e) => setDespesasType(e.target.value)}>{DESPESAS_TYPES.map(h => <option key={h} value={h}>{h}</option>)}</select> : <input type="text" className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 font-bold text-emerald-700 outline-none" value={despesasType} onChange={(e) => setDespesasType(e.target.value)} />}
                <button type="button" onClick={() => setIsManualContext(!isManualContext)} className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl"><Plus size={20} /></button>
              </div>
            </div>
          )}

          {type === 'saida' && category === 'Animais' && (
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sub-Categoria Animais</label>
              <div className="flex items-center gap-2">
                {!isManualContext ? <select className="flex-1 bg-violet-50 border border-violet-100 rounded-2xl px-6 py-4 font-bold text-violet-700 outline-none" value={animaisType} onChange={(e) => setAnimaisType(e.target.value)}>{ANIMAIS_TYPES.map(h => <option key={h} value={h}>{h}</option>)}</select> : <input type="text" className="flex-1 bg-violet-50 border border-violet-100 rounded-2xl px-6 py-4 font-bold text-violet-700 outline-none" value={animaisType} onChange={(e) => setAnimaisType(e.target.value)} />}
                <button type="button" onClick={() => setIsManualContext(!isManualContext)} className="p-4 bg-violet-100 text-violet-700 rounded-2xl"><Plus size={20} /></button>
              </div>
            </div>
          )}

          {type === 'saida' && (
            <div className={`p-6 rounded-3xl border transition-all space-y-4 ${hasInvoice ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative"><input type="checkbox" className="sr-only peer" id="edit-invoice-toggle" checked={hasInvoice} onChange={(e) => handleInvoiceToggle(e.target.checked)} /><label htmlFor="edit-invoice-toggle" className="w-12 h-7 bg-slate-200 rounded-full peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full cursor-pointer block"></label></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Fatura Fiscal</span>
                </div>
                {hasInvoice && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-emerald-100">
                    <input type="checkbox" id="edit-no-nif" className="accent-rose-500" checked={isNoNif} onChange={(e) => { setIsNoNif(e.target.checked); if (e.target.checked) setInvoiceNumber(''); }} />
                    <label htmlFor="edit-no-nif" className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 cursor-pointer"><UserMinus size={12} /> Sem NIF</label>
                  </div>
                )}
              </div>
              {hasInvoice && !isNoNif && (
                <div className="relative"><FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={16} /><input type="text" className="w-full bg-white border border-emerald-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-emerald-700 outline-none" placeholder="Nº Fatura" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} /></div>
              )}
            </div>
          )}

          <div className="pt-4 flex flex-col md:flex-row gap-4">
            <button type="button" onClick={onClose} className="px-6 bg-slate-100 text-slate-500 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] order-3 md:order-1">Cancelar</button>
            {onDelete && <button type="button" onClick={() => onDelete(transaction.id)} className="px-6 bg-rose-50 text-rose-600 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 order-2"><Trash2 size={18} /> Eliminar</button>}
            <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 flex items-center justify-center gap-2 order-1 md:order-3 active:scale-95"><Check size={20} className="text-emerald-400" /> Guardar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
