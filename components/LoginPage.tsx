
import React, { useState } from 'react';
import { Sparkles, Mail, Lock, Loader2 } from 'lucide-react';

import { TranslationType } from '../translations';

interface Props {
  onLogin: (email: string) => void;
  onBack: () => void;
  t: TranslationType;
}

const LoginPage: React.FC<Props> = ({ onLogin, onBack, t }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin(email);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-slate-200 p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>

        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
            <Sparkles size={32} className="fill-emerald-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">{t.login.welcomeBack}</h2>
          <p className="text-slate-400 mt-2">{t.login.accessAccount}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">{t.login.email}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all placeholder:text-[10px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">{t.login.password}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all placeholder:text-[10px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : t.login.enterAccount}
          </button>
        </form>

        <button
          onClick={onBack}
          className="w-full mt-6 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
        >
          {t.login.backToHome}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
