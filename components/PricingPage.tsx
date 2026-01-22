
import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles, Shield, Zap, Heart, History, TrendingUp, Target, ChevronLeft } from 'lucide-react';

import { TranslationType } from '../translations';

interface Props {
  onSelectPlan: (plan: 'monthly' | 'yearly') => void;
  onBack: () => void;
  currencySymbol: string;
  t: TranslationType;
}

const PricingPage: React.FC<Props> = ({ onSelectPlan, onBack, currencySymbol, t }) => {
  const [isYearly, setIsYearly] = useState(true);

  const plans = [
    {
      id: 'family',
      name: t.pricing.familyPlanName,
      description: t.pricing.familyPlanDesc,
      monthlyPrice: 9.99,
      yearlyPrice: 89.99,
      features: t.pricing.features,
      icon: <Sparkles className="text-emerald-500" size={32} />,
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-6 overflow-x-hidden">
      <button
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-all font-bold text-sm uppercase tracking-widest"
      >
        <ChevronLeft size={20} /> {t.common.back}
      </button>

      <div className="max-w-4xl w-full text-center space-y-6 mb-16">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
          {t.pricing.investTranquility.split('Tranquilidade')[0]}
          <span className="text-emerald-600">
            {t.common.cancel === 'Cancelar' ? 'Tranquilidade' : t.common.cancel === 'Cancel' ? 'Peace of Mind' : 'Tranquilidad'}
          </span>.
        </h2>
        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          {t.pricing.choosePlan}
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 pt-6">
          <span className={`text-sm font-bold uppercase tracking-widest ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>{t.pricing.monthly}</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-16 h-8 bg-white border-2 border-slate-200 rounded-full relative transition-all"
          >
            <div className={`absolute top-1 w-5 h-5 bg-emerald-600 rounded-full transition-all ${isYearly ? 'left-9' : 'left-1'}`} />
          </button>
          <span className={`text-sm font-bold uppercase tracking-widest ${isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
            {t.pricing.yearly} <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] ml-1">{t.pricing.off25}</span>
          </span>
        </div>
      </div>

      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-[48px] shadow-2xl shadow-slate-200 p-10 border-2 border-emerald-500 relative overflow-hidden group">
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-emerald-600 text-white px-8 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">
                {t.pricing.recommended}
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-emerald-50 rounded-3xl">
                {plan.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                <p className="text-slate-400 text-sm font-medium">{plan.description}</p>
              </div>
            </div>

            <div className="mb-10">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900">
                  {isYearly ? plan.yearlyPrice : plan.monthlyPrice}{currencySymbol}
                </span>
                <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                  / {isYearly ? t.pricing.perYear : t.pricing.perMonth}
                </span>
              </div>
              {isYearly && (
                <p className="text-emerald-600 text-xs font-bold mt-2">{t.pricing.equivalentTo} {(plan.yearlyPrice / 12).toFixed(2)}{currencySymbol} {t.pricing.perMonth.toLowerCase()}!</p>
              )}
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-600 font-medium">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectPlan(isYearly ? 'yearly' : 'monthly')}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
            >
              {t.pricing.buyNow} <ArrowRight size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl w-full">
        <div className="flex flex-col items-center text-center space-y-3">
          <Shield className="text-slate-300" size={32} />
          <h4 className="font-bold text-slate-800">{t.pricing.totalSecurity}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{t.pricing.securityDesc}</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <Zap className="text-slate-300" size={32} />
          <h4 className="font-bold text-slate-800">{t.pricing.instantInstall}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{t.pricing.installDesc}</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <Heart className="text-slate-300" size={32} />
          <h4 className="font-bold text-slate-800">{t.pricing.satisfactionGuaranteed}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{t.pricing.satisfactionDesc}</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
