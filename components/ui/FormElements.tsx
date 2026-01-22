
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    variant?: 'slate' | 'orange' | 'emerald' | 'blue' | 'white' | 'emerald-dark' | 'slate-emerald';
}

export const Input: React.FC<InputProps> = ({ label, icon, variant = 'slate', className = '', ...props }) => {
    const variantStyles = {
        slate: 'bg-slate-50 border-slate-100 focus:ring-emerald-500/10',
        orange: 'bg-orange-50 border-orange-100 text-orange-700 focus:ring-orange-500/10',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700 focus:ring-emerald-500/10',
        blue: 'bg-blue-50 border-blue-100 text-blue-700 focus:ring-blue-500/10',
        white: 'bg-white border-slate-200 focus:ring-emerald-500/10',
        'emerald-dark': 'bg-emerald-600 border-emerald-500 text-white placeholder:text-white/60 focus:ring-white/10',
        'slate-emerald': 'bg-slate-900 border-emerald-500 text-white placeholder:text-white/60 focus:ring-emerald-500/20'
    };

    return (
        <div className={`space-y-1 ${className}`}>
            {label && <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{label}</label>}
            <div className="relative">
                {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
                <input
                    className={`w-full border rounded-2xl ${icon ? 'pl-12' : 'px-6'} py-4 font-bold outline-none transition-all placeholder:text-[10px] ${variantStyles[variant]}`}
                    {...props}
                />
            </div>
        </div>
    );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    variant?: 'slate' | 'orange' | 'emerald' | 'blue' | 'emerald-dark' | 'slate-emerald';
}

export const Select: React.FC<SelectProps> = ({ label, variant = 'slate', className = '', children, ...props }) => {
    const variantStyles = {
        slate: 'bg-slate-50 border-slate-100 focus:ring-emerald-500/10',
        orange: 'bg-orange-600 text-white border-transparent focus:ring-orange-500/20',
        emerald: 'bg-emerald-600 text-white border-transparent focus:ring-emerald-500/20',
        blue: 'bg-blue-600 text-white border-transparent focus:ring-blue-500/20',
        'emerald-dark': 'bg-emerald-600 text-white border-emerald-500 focus:ring-white/20',
        'slate-emerald': 'bg-slate-900 text-white border-emerald-500 focus:ring-emerald-500/20'
    };

    return (
        <div className={`space-y-1 ${className}`}>
            {label && <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{label}</label>}
            <select
                className={`w-full border rounded-2xl px-6 py-4 font-bold outline-none cursor-pointer transition-all ${variantStyles[variant]}`}
                {...props}
            >
                {children}
            </select>
        </div>
    );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'emerald' | 'orange' | 'blue' | 'slate' | 'ghost-emerald';
    icon?: React.ReactNode;
    fullWidth?: boolean;
    noShadow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'emerald', icon, fullWidth, noShadow, children, className = '', ...props }) => {
    const variantStyles = {
        emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100',
        orange: 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-100',
        blue: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100',
        slate: 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-100',
        'ghost-emerald': 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
    };

    return (
        <button
            className={`
        ${variantStyles[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest ${noShadow ? '' : 'shadow-xl'} transition-all active:scale-95 flex items-center justify-center gap-2
        ${className}
      `}
            {...props}
        >
            {icon}
            {children}
        </button>
    );
};
