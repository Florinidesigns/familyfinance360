
import React from 'react';
import { Home, History, Target, TrendingUp, Bell } from 'lucide-react';
import { TranslationType } from '../translations';

interface Props {
    activeTab: string;
    onNavigate: (tab: string) => void;
    t: TranslationType;
    alertCount?: number;
}

const MobileMenu: React.FC<Props> = ({ activeTab, onNavigate, t, alertCount = 0 }) => {
    const items = [
        { id: 'dashboard', icon: <Home size={24} />, label: 'Home' },
        { id: 'alerts', icon: <Bell size={24} />, label: t.nav.alerts },
        { id: 'past', icon: <History size={24} />, label: t.nav.past },
        { id: 'present', icon: <Target size={24} />, label: t.nav.present },
        { id: 'future', icon: <TrendingUp size={24} />, label: t.nav.future },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-2 pb-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
            <div className="flex justify-around items-center">
                {items.map((item) => {
                    const isActive = activeTab === item.id;
                    const isAlertsWithNotifications = item.id === 'alerts' && alertCount > 0;

                    let colorClass;
                    if (isActive) {
                        if (item.id === 'alerts' && isAlertsWithNotifications) {
                            colorClass = 'text-rose-600';
                        } else if (item.id === 'past') {
                            colorClass = 'text-orange-600';
                        } else if (item.id === 'present') {
                            colorClass = 'text-emerald-600';
                        } else if (item.id === 'future') {
                            colorClass = 'text-blue-600';
                        } else {
                            colorClass = 'text-slate-900 dark:text-white';
                        }
                    } else if (isAlertsWithNotifications) {
                        colorClass = 'text-rose-600 dark:text-rose-400';
                    } else {
                        colorClass = 'text-slate-400 dark:text-slate-600';
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all relative ${isActive ? 'bg-slate-50 dark:bg-slate-800' : ''}`}
                        >
                            <div className={`${colorClass} transition-colors`}>{item.icon}</div>
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${colorClass}`}>{item.label}</span>
                            {isAlertsWithNotifications && (
                                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
                                    {alertCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileMenu;

