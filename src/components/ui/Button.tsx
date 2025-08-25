import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
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
    primary: 'bg-violet-600/20 border-violet-500/30 text-white hover:bg-violet-600/30 hover:border-violet-400/50 shadow-lg shadow-violet-500/20',
    secondary: 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-lg shadow-black/10',
    ghost: 'bg-transparent border-transparent text-white/80 hover:bg-white/10 hover:text-white',
    danger: 'bg-red-600/20 border-red-500/30 text-white hover:bg-red-600/30 hover:border-red-400/50 shadow-lg shadow-red-500/20'
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
      <div className="relative z-10">
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