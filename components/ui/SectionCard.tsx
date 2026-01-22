
import React from 'react';

interface Props {
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    headerAction?: React.ReactNode;
    variant?: 'white' | 'slate' | 'emerald' | 'orange' | 'blue';
}

const SectionCard: React.FC<Props> = ({
    title,
    subtitle,
    icon,
    children,
    className = '',
    headerAction,
    variant = 'white'
}) => {
    const variantStyles = {
        white: 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100',
        slate: 'bg-slate-900 dark:bg-black border-slate-800 dark:border-slate-900 text-white',
        emerald: 'bg-emerald-600 border-emerald-500 text-white',
        orange: 'bg-orange-600 border-orange-500 text-white',
        blue: 'bg-blue-600 border-blue-500 text-white'
    };

    const shadowStyles = variant === 'white' ? 'shadow-sm' : 'shadow-xl';
    const roundedStyles = 'rounded-[40px] md:rounded-[48px]';

    return (
        <div className={`${variantStyles[variant]} ${shadowStyles} ${roundedStyles} border p-8 md:p-10 relative overflow-hidden ${className}`}>
            {(title || icon) && (
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        {icon && <div className={variant === 'white' ? 'text-emerald-600' : 'text-white/80'}>{icon}</div>}
                        <div>
                            {title && <h3 className={`text-xl md:text-2xl font-black ${variant === 'white' ? 'text-slate-800 dark:text-white' : 'text-white'}`}>{title}</h3>}
                            {subtitle && <p className={`text-sm opacity-60 max-w-md ${variant === 'white' ? 'text-slate-500 dark:text-slate-400' : 'text-white/80'}`}>{subtitle}</p>}
                        </div>
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className="relative z-10">
                {children}
            </div>
            {icon && variant !== 'white' && (
                <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                    {React.cloneElement(icon as React.ReactElement, { size: 180 })}
                </div>
            )}
        </div>
    );
};

export default SectionCard;
