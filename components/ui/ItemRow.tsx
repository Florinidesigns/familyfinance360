
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
        slate: 'bg-slate-50 border-slate-100 hover:bg-slate-100',
        orange: 'bg-orange-50 border-orange-100 hover:bg-orange-100/50',
        emerald: 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50',
        blue: 'bg-blue-50 border-blue-100 hover:bg-blue-100/50'
    };

    const iconStyles = {
        slate: 'bg-white text-slate-500 border-slate-100',
        orange: 'bg-white text-orange-600 border-orange-100',
        emerald: 'bg-white text-emerald-600 border-emerald-100',
        blue: 'bg-white text-blue-600 border-blue-100'
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
                    <p className="font-black text-lg text-slate-800 leading-tight">{title}</p>
                    {subtitle && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subtitle}</p>}
                    {valueInside && value && <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{t?.common.incomeLabel || 'Rendimento'}: {value}</p>}
                </div>
            </div>

            <div className="flex items-center gap-6">
                {!valueInside && value && <p className="text-xl font-black text-slate-800">{value}</p>}
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
