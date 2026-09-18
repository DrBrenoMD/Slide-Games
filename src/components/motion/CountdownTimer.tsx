import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  isActive: boolean;
  onTimeUp?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'circle' | 'bar';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  totalSeconds,
  remainingSeconds,
  isActive,
  onTimeUp,
  size = 'md',
  variant = 'circle'
}) => {
  useEffect(() => {
    if (remainingSeconds <= 0 && isActive && onTimeUp) {
      onTimeUp();
    }
  }, [remainingSeconds, isActive, onTimeUp]);

  const percentage = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100));

  const getColor = () => {
    if (percentage > 50) return '#10B981'; // Emerald
    if (percentage > 25) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const currentColor = getColor();
  const isUrgent = remainingSeconds <= 5 && remainingSeconds > 0 && isActive;

  if (variant === 'bar') {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between text-xs font-semibold mb-1 text-slate-300">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Tempo Restante
          </span>
          <span
            className={`font-mono text-sm font-bold ${
              isUrgent ? 'text-red-400 scale-110' : 'text-slate-200'
            } transition-transform`}
          >
            {remainingSeconds}s
          </span>
        </div>
        <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'linear' }}
            className="h-full rounded-full transition-colors duration-500"
            style={{ backgroundColor: currentColor }}
          />
        </div>
      </div>
    );
  }

  const dimensions = size === 'lg' ? 90 : size === 'sm' ? 44 : 64;
  const strokeWidth = size === 'lg' ? 6 : size === 'sm' ? 4 : 5;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${
        isUrgent ? 'animate-bounce' : ''
      }`}
      style={{ width: dimensions, height: dimensions }}
    >
      <svg width={dimensions} height={dimensions} className="-rotate-90">
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
        />
        <motion.circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="transparent"
          stroke={currentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.9, ease: 'linear' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono font-black">
        <span
          className={`${
            size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-xs' : 'text-lg'
          } ${isUrgent ? 'text-red-400 font-extrabold' : 'text-white'}`}
        >
          {remainingSeconds}
        </span>
        {size === 'lg' && (
          <span className="text-[10px] text-slate-400 -mt-1 uppercase tracking-tighter">seg</span>
        )}
      </div>
    </div>
  );
};
