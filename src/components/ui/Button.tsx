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
  const baseClasses = 'relative overflow-hidden rounded-xl font-medium transition-all duration-200 backdrop-blur-md border';
  
  const variantClasses = {
    primary: 'theme-accent/20 theme-border-accent theme-text-primary hover:theme-accent/30 hover:theme-border-accent shadow-lg',
    secondary: 'theme-bg-secondary theme-border theme-text-primary hover:theme-bg-tertiary hover:theme-border shadow-lg',
    ghost: 'bg-transparent border-transparent theme-text-secondary hover:theme-bg-tertiary hover:theme-text-primary',
    danger: 'bg-red-600/20 border-red-500/30 theme-text-primary hover:bg-red-600/30 hover:border-red-400/50 shadow-lg shadow-red-500/20',
    outline: 'bg-transparent theme-border theme-text-primary hover:theme-bg-tertiary',
    default: 'theme-accent/20 theme-border-accent theme-text-primary hover:theme-accent/30 hover:theme-border-accent shadow-lg'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
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
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  );
};