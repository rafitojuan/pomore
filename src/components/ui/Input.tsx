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
  const baseClasses = 'w-full px-3 py-2 text-sm bg-zinc-900/50 dark:bg-zinc-900/50 bg-white border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-150 shadow-sm';

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