
import React from 'react';
import { Home, History, Target, TrendingUp } from 'lucide-react';
import { TranslationType } from '../translations';

interface Props {
    activeTab: string;
    onNavigate: (tab: string) => void;
    t: TranslationType;
}

const MobileMenu: React.FC<Props> = ({ activeTab, onNavigate, t }) => {
    const items = [
        { id: 'dashboard', icon: <Home size={24} />, label: 'Home' }, // 'Home' or 'Início' - user said "HOUSE"
        { id: 'past', icon: <History size={24} />, label: t.nav.past },
        { id: 'present', icon: <Target size={24} />, label: t.nav.present },
        { id: 'future', icon: <TrendingUp size={24} />, label: t.nav.future },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-2 pb-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
            <div className="flex justify-around items-center">
                {items.map((item) => {
                    const isActive = activeTab === item.id;
                    const colorClass = isActive
                        ? (item.id === 'past' ? 'text-orange-600' : item.id === 'present' ? 'text-emerald-600' : item.id === 'future' ? 'text-blue-600' : 'text-slate-900 dark:text-white')
                        : 'text-slate-400 dark:text-slate-600';

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${isActive ? 'bg-slate-50 dark:bg-slate-800' : ''}`}
                        >
                            <div className={`${colorClass} transition-colors`}>{item.icon}</div>
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${colorClass}`}>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileMenu;
