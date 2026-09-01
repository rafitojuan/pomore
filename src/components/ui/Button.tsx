import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'default';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50';

  const variantClasses = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-sm border border-emerald-500/30',
    secondary: 'theme-bg-secondary theme-border border theme-text-primary hover:theme-bg-tertiary shadow-sm',
    ghost: 'bg-transparent border border-transparent theme-text-secondary hover:theme-bg-tertiary hover:theme-text-primary',
    danger: 'bg-rose-600/10 text-rose-500 border border-rose-500/20 hover:bg-rose-600/20 active:bg-rose-600/30',
    outline: 'bg-transparent theme-border border theme-text-primary hover:theme-bg-tertiary',
    default: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-sm border border-emerald-500/30'
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled ? disabledClasses : 'cursor-pointer'}
    ${className}
  `.trim();

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
    </motion.button>
  );
};