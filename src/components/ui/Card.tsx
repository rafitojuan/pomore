import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  variant = 'default'
}) => {
  const baseClasses = 'relative overflow-hidden rounded-2xl backdrop-blur-md border transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white/10 border-white/20 shadow-lg shadow-black/10',
    elevated: 'bg-white/15 border-white/25 shadow-xl shadow-black/20',
    outlined: 'bg-white/5 border-white/30 shadow-md shadow-black/5'
  };
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const hoverClasses = hover ? 'hover:bg-white/20 hover:border-white/30 hover:shadow-xl hover:shadow-black/20 cursor-pointer' : '';
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${className}
  `.trim();

  const CardComponent = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { scale: 1.02, y: -2 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <CardComponent
      className={classes}
      {...motionProps}
    >
      <div className="relative z-10">
        {children}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    </CardComponent>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
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
    <h3 className={`text-xl font-semibold text-white ${className}`}>
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
    <div className={`text-white/80 ${className}`}>
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
    <div className={`mt-4 pt-4 border-t border-white/10 ${className}`}>
      {children}
    </div>
  );
};