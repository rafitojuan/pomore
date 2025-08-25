import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 200,
  strokeWidth = 8,
  color = '#7C3AED',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  children,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-30"
        />
        
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="drop-shadow-lg"
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`
          }}
        />
        
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth / 2}
          fill="transparent"
          stroke="url(#gradient)"
          strokeWidth="1"
          className="opacity-20"
        />
        
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
      
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, className = '' }) => {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {value}
    </motion.span>
  );
};