import React from 'react';

interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  className?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  step?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  onKeyPress,
  onFocus,
  onBlur,
  placeholder,
  type = 'text',
  className = '',
  disabled = false,
  min,
  max,
  step
}) => {
  const baseClasses = 'w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/50 transition-all duration-200';
  
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      className={classes}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
    />
  );
};