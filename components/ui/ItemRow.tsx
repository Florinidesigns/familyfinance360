
import React from 'react';
import { Trash2, Pencil } from 'lucide-react';

import { TranslationType } from '../../translations';

interface Props {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    value?: string;
    valueInside?: boolean;
    onDelete?: () => void;
    onEdit?: () => void;
    variant?: 'slate' | 'orange' | 'emerald' | 'blue';
    t?: TranslationType;
}

const ItemRow: React.FC<Props> = ({
    icon,
    title,
    subtitle,
    value,
    valueInside,
    onDelete,
    onEdit,
    variant = 'slate',
    t
}) => {
    const variantStyles = {
        slate: 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80',
        orange: 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30 hover:bg-orange-100/50 dark:hover:bg-orange-900/40',
        emerald: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40',
        blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 hover:bg-blue-100/50 dark:hover:bg-blue-900/40'
    };

    const iconStyles = {
        slate: 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700',
        orange: 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-slate-700',
        emerald: 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-slate-700',
        blue: 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-slate-700'
    };

    return (
        <div className={`p-6 rounded-[32px] border flex items-center justify-between group transition-all ${variantStyles[variant]}`}>
            <div className="flex items-center gap-6">
                {icon && (
                    <div className={`p-4 rounded-2xl border shadow-sm ${iconStyles[variant]}`}>
                        {icon}
                    </div>
                )}
                <div>
                    <p className="font-black text-lg text-slate-800 dark:text-slate-100 leading-tight">{title}</p>
                    {subtitle && <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{subtitle}</p>}
                    {valueInside && value && <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">{t?.common.incomeLabel || 'Rendimento'}: {value}</p>}
                </div>
            </div>

            <div className="flex items-center gap-6">
                {!valueInside && value && <p className="text-xl font-black text-slate-800 dark:text-slate-100">{value}</p>}
                <div className="flex items-center gap-2">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-3 text-slate-300 hover:text-blue-600 rounded-xl transition-all hover:bg-white"
                        >
                            <Pencil size={18} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="p-3 text-slate-300 hover:text-rose-600 rounded-xl transition-all hover:bg-white"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemRow;
