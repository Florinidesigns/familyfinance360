
import React from 'react';
import { LayoutDashboard, Target, History, TrendingUp, Sparkles, LogOut, Settings, FileText, Download, FileCheck, Sliders } from 'lucide-react';
import { apiService } from '../services/apiService';
import { TranslationType } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  t: TranslationType;
  language: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, t, language }) => {
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: t.nav.dashboard },
    { id: 'past', icon: <History size={20} />, label: t.nav.past },
    { id: 'present', icon: <Target size={20} />, label: t.nav.present },
    { id: 'future', icon: <TrendingUp size={20} />, label: t.nav.future },
    { id: 'irs', icon: <FileText size={20} />, label: t.nav.irs },
    { id: 'reports', icon: <Download size={20} />, label: t.nav.reports },
    { id: 'backoffice', icon: <Sliders size={20} />, label: t.nav.backoffice },
    { id: 'settings', icon: <Settings size={20} />, label: t.nav.settings },
  ].filter(item => item.id !== 'irs' || language === 'Português');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      <nav className="fixed bottom-0 w-full md:relative md:w-64 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-colors duration-300">
        <div className="p-8 hidden md:block">
          <h1 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
            <Sparkles className="fill-emerald-600" /> Finanças360
          </h1>
        </div>

        <ul className="flex md:flex-col justify-around md:justify-start p-2 md:p-6 gap-3 flex-1 overflow-x-auto md:overflow-x-visible">
          {navItems.map((item) => (
            <li key={item.id} className="flex-shrink-0">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all ${activeTab === item.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-none font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                {item.icon}
                <span className="text-xs md:text-sm lg:text-base">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden md:block p-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => apiService.logout()}
            className="flex items-center gap-3 w-full p-4 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-medium"
          >
            <LogOut size={20} />
            <span>{t.nav.logout}</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
