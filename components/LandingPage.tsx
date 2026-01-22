
import React from 'react';
import { Sparkles, History, Target, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  onStart: () => void; // Fluxo para novos utilizadores (Preços)
  onLogin: () => void; // Fluxo para quem já tem conta (Login)
}

const LandingPage: React.FC<Props> = ({ onStart, onLogin }) => {
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
          Entrar
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Domine o seu <span className="text-emerald-600">Dinheiro</span>, <br />
          Desenhe o seu <span className="text-blue-600">Destino</span>.
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          A única ferramenta que integra o seu passado financeiro, a gestão do seu presente e a construção do seu futuro num único dashboard inteligente.
        </p>
        <button 
          onClick={onStart}
          className="group bg-slate-900 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-3 mx-auto shadow-2xl"
        >
          Começar Agora <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <History size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">O Passado</h3>
            <p className="text-slate-500">Controle as suas dívidas de longo prazo, hipotecas e créditos. Saiba exatamente quanto falta para a sua liberdade.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 ring-2 ring-emerald-500 ring-offset-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Target size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">O Presente</h3>
            <p className="text-slate-500">Gestão diária de gastos, supermercado e lazer. Visualize para onde vai cada cêntimo e receba conselhos da nossa IA.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">O Futuro</h3>
            <p className="text-slate-500">Transfira poupanças em tempo real. Armazene dinheiro para os seus sonhos e veja a sua independência crescer.</p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 text-center px-6">
        <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold mb-4">
          <ShieldCheck /> Segurança de Nível Bancário
        </div>
        <p className="text-slate-400 text-sm italic">Os seus dados são encriptados e armazenados localmente na sua "base de dados" segura.</p>
      </section>
    </div>
  );
};

export default LandingPage;
