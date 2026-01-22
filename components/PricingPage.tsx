
import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles, Shield, Zap, Heart, History, TrendingUp, Target, ChevronLeft } from 'lucide-react';

interface Props {
  onSelectPlan: (plan: 'monthly' | 'yearly') => void;
  onBack: () => void;
  currencySymbol: string;
}

const PricingPage: React.FC<Props> = ({ onSelectPlan, onBack, currencySymbol }) => {
  const [isYearly, setIsYearly] = useState(true);

  const plans = [
    {
      id: 'family',
      name: 'Plano Familiar 360',
      description: 'Gestão completa para toda a casa.',
      monthlyPrice: 9.99,
      yearlyPrice: 89.99,
      features: [
        'Dashboard Passado, Presente e Futuro',
        'Consultoria IA Financeira Ilimitada',
        'Exportação de Relatórios PDF/Excel',
        'Controlo de Faturas e Impostos',
        'Gestão de Múltiplos Créditos',
        'Suporte Prioritário 24/7'
      ],
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
        <ChevronLeft size={20} /> Voltar
      </button>

      <div className="max-w-4xl w-full text-center space-y-6 mb-16">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
          Invista na sua <span className="text-emerald-600">Tranquilidade</span>.
        </h2>
        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Escolha o plano que melhor se adapta à dinâmica da sua família e comece hoje a desenhar um futuro próspero.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 pt-6">
          <span className={`text-sm font-bold uppercase tracking-widest ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>Mensal</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-16 h-8 bg-white border-2 border-slate-200 rounded-full relative transition-all"
          >
            <div className={`absolute top-1 w-5 h-5 bg-emerald-600 rounded-full transition-all ${isYearly ? 'left-9' : 'left-1'}`} />
          </button>
          <span className={`text-sm font-bold uppercase tracking-widest ${isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
            Anual <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] ml-1">-25% OFF</span>
          </span>
        </div>
      </div>

      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-[48px] shadow-2xl shadow-slate-200 p-10 border-2 border-emerald-500 relative overflow-hidden group">
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-emerald-600 text-white px-8 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">
                Recomendado
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
                  / {isYearly ? 'Ano' : 'Mês'}
                </span>
              </div>
              {isYearly && (
                <p className="text-emerald-600 text-xs font-bold mt-2">Equivale a apenas {(plan.yearlyPrice / 12).toFixed(2)}{currencySymbol} por mês!</p>
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
              Comprar Agora <ArrowRight size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl w-full">
        <div className="flex flex-col items-center text-center space-y-3">
          <Shield className="text-slate-300" size={32} />
          <h4 className="font-bold text-slate-800">Segurança Total</h4>
          <p className="text-xs text-slate-400 leading-relaxed">Os seus dados bancários e pessoais são encriptados com tecnologia de ponta.</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <Zap className="text-slate-300" size={32} />
          <h4 className="font-bold text-slate-800">Instalação Instantânea</h4>
          <p className="text-xs text-slate-400 leading-relaxed">Aceda a todas as ferramentas premium segundos após a sua subscrição.</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <Heart className="text-slate-300" size={32} />
          <h4 className="font-bold text-slate-800">Satisfação Garantida</h4>
          <p className="text-xs text-slate-400 leading-relaxed">Cancele a qualquer momento sem perguntas ou taxas escondidas.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
