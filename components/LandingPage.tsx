
import React from 'react';
import { Sparkles, History, Target, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';

import { TranslationType } from '../translations';

interface Props {
  onStart: () => void; // Fluxo para novos utilizadores (Preços)
  onLogin: () => void; // Fluxo para quem já tem conta (Login)
  t: TranslationType;
}

const LandingPage: React.FC<Props> = ({ onStart, onLogin, t }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* Header */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-2xl font-bold text-emerald-600">
          <Sparkles className="fill-emerald-600" /> Finanças360
        </div>
        <button
          onClick={onLogin}
          className="bg-emerald-600 text-white px-8 py-3 rounded-full font-black transition-all text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:scale-105 active:scale-95"
        >
          {t.landing.enter}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight">
          {t.landing.heroTitle.split(',')[0]}, <br />
          <span className="text-emerald-600">{t.landing.heroTitle.split(',')[1]}</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          {t.landing.heroSubtitle}
        </p>
        <button
          onClick={onStart}
          className="group bg-slate-900 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-3 mx-auto shadow-2xl"
        >
          {t.landing.startNow} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <History size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">{t.landing.pastTitle}</h3>
            <p className="text-slate-500">{t.landing.pastDesc}</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 ring-2 ring-emerald-500 ring-offset-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Target size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">{t.landing.presentTitle}</h3>
            <p className="text-slate-500">{t.landing.presentDesc}</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">{t.landing.futureTitle}</h3>
            <p className="text-slate-500">{t.landing.futureDesc}</p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 text-center px-6">
        <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold mb-4">
          <ShieldCheck /> {t.landing.bankSecurity}
        </div>
        <p className="text-slate-400 text-sm italic">{t.landing.securityDesc}</p>
      </section>
    </div>
  );
};

export default LandingPage;
