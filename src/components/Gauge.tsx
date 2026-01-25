import { useMemo } from 'react';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  color?: string;
  showPercentage?: boolean;
  warningThreshold?: number;
  dangerThreshold?: number;
}

export function Gauge({
  value,
  max,
  label,
  color = '#22c55e',
  showPercentage = true,
  warningThreshold,
  dangerThreshold,
}: GaugeProps) {
  const percentage = useMemo(() => {
    if (max === 0) return 0;
    return Math.min((value / max) * 100, 100);
  }, [value, max]);

  const getColor = useMemo(() => {
    if (dangerThreshold && percentage >= dangerThreshold) return '#ef4444';
    if (warningThreshold && percentage >= warningThreshold) return '#f59e0b';
    return color;
  }, [percentage, warningThreshold, dangerThreshold, color]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#334155"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-dark-100">
            {showPercentage ? `${percentage.toFixed(0)}%` : value.toFixed(0)}
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-dark-300 text-center">{label}</span>
    </div>
  );
}
