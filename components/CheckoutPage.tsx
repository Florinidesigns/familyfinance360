
import React, { useState } from 'react';
import { ChevronLeft, ShieldCheck, Smartphone, Check, Loader2, Info, Building2, User, CreditCard } from 'lucide-react';

import { TranslationType } from '../translations';

interface Props {
  plan: 'monthly' | 'yearly';
  onPaymentSuccess: () => void;
  onBack: () => void;
  currencySymbol: string;
  t: TranslationType;
}

const CheckoutPage: React.FC<Props> = ({ plan, onPaymentSuccess, onBack, currencySymbol, t }) => {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    nif: '',
    address: ''
  });

  const price = plan === 'yearly' ? 89.99 : 9.99;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 9) return;

    setLoading(true);
    // Simulating MBWay notification and wait time
    setTimeout(() => {
      onPaymentSuccess();
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-12 px-6 transition-colors duration-300">
      <button
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-bold text-sm uppercase tracking-widest"
      >
        <ChevronLeft size={20} /> {t.checkout.changePlan}
      </button>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-5 gap-12 items-start mt-10">

        {/* Billing Info Form */}
        <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-8 duration-500">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t.checkout.finishSubscription}</h2>
            <p className="text-slate-400 dark:text-slate-500 font-medium">{t.checkout.billingAndPayment}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Building2 size={20} className="text-emerald-600 dark:text-emerald-400" /> {t.checkout.billingData}
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">{t.checkout.fullName}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                  <input
                    type="text"
                    required
                    placeholder={t.checkout.fullNamePlaceholder}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">{t.checkout.nif}</label>
                  <input
                    type="text"
                    maxLength={9}
                    placeholder={t.checkout.nifPlaceholder}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
                    value={formData.nif}
                    onChange={e => setFormData({ ...formData, nif: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">{t.checkout.country}</label>
                  <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none dark:text-white">
                    <option>{t.common.cancel === 'Cancelar' ? 'Brasil' : t.common.cancel === 'Cancel' ? 'Brazil' : 'Brasil'}</option>
                    <option>{t.common.cancel === 'Cancelar' ? 'Espanha' : t.common.cancel === 'Cancel' ? 'Spain' : 'España'}</option>
                    <option>{t.common.cancel === 'Cancelar' ? 'Portugal' : t.common.cancel === 'Cancel' ? 'Portugal' : 'Portugal'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 ml-1">{t.checkout.address}</label>
                <input
                  type="text"
                  placeholder={t.checkout.addressPlaceholder}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-8">
              <CreditCard size={20} className="text-emerald-600 dark:text-emerald-400" /> {t.checkout.paymentMethod}
            </h3>

            <div className="p-6 border-2 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-[32px] relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-xs">
                    MB
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">MBWay</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.checkout.mbwaySecure}</p>
                  </div>
                </div>
                <Check className="text-emerald-600" size={24} strokeWidth={3} />
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 ml-1">{t.checkout.mbwayMobile}</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" size={18} />
                    <input
                      type="tel"
                      required
                      placeholder={t.checkout.mbwayPlaceholder}
                      maxLength={9}
                      className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-lg dark:text-white"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || phoneNumber.length < 9}
                  className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg dark:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {t.checkout.waitConfirmation}
                    </>
                  ) : (
                    <>{t.checkout.payWithMbway} {price}{currencySymbol} {t.common.cancel === 'Cancelar' ? 'com MBWay' : t.common.cancel === 'Cancel' ? 'with MBWay' : 'con MBWay'}</>
                  )}
                </button>
              </form>

              {loading && (
                <div className="mt-6 p-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-emerald-100 dark:border-emerald-900 align-pulse flex items-start gap-3">
                  <Info size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                    {t.checkout.mbwayNotification}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-white">
            <h3 className="text-xl font-bold mb-6">{t.checkout.orderSummary}</h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 dark:text-slate-500 font-medium">{t.pricing.familyPlanName} ({plan === 'yearly' ? t.pricing.yearly : t.pricing.monthly})</span>
                <span className="font-bold">{price}{currencySymbol}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 dark:text-slate-500 font-medium">{t.checkout.taxes}</span>
                <span className="font-bold">0.00{currencySymbol}</span>
              </div>
              <div className="pt-4 border-t border-white/10 dark:border-slate-800 flex justify-between items-end">
                <span className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">{t.checkout.totalToPay}</span>
                <span className="text-3xl font-black text-emerald-400">{price}{currencySymbol}</span>
              </div>
            </div>

            <div className="bg-white/5 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">{t.checkout.whatYouGet}</p>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={4} />
                </div>
                <span>{t.checkout.immediateAccess}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={4} />
                </div>
                <span>{t.checkout.unlimitedAi}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={4} />
                </div>
                <span>{t.checkout.smartInvoices}</span>
              </div>
            </div>
          </div>

          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-[32px] bg-white dark:bg-slate-900 flex items-center gap-4 transition-colors duration-300">
            <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={32} />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">{t.checkout.securePurchase}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">{t.checkout.securePurchaseDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
