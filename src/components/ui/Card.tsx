import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined' | 'thick-border';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  variant = 'default'
}) => {
  const baseClasses = 'relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-200';

  const variantClasses = {
    default: 'shadow-sm',
    elevated: 'shadow-md dark:bg-zinc-900/80',
    outlined: 'border-zinc-200 dark:border-zinc-800',
    'thick-border': 'border-2 border-emerald-500/40 shadow-sm'
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6'
  };

  const hoverClasses = hover ? 'hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md cursor-pointer' : '';

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${className}
  `.trim();

  const CardComponent = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { y: -1 },
    transition: { duration: 0.15 }
  } : {};

  return (
    <CardComponent
      className={classes}
      {...motionProps}
    >
      <div className="relative z-10">
        {children}
      </div>
    </CardComponent>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-3 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 ${className}`}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`text-zinc-600 dark:text-zinc-400 text-sm ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};
