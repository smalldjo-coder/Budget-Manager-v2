import { ReactNode } from 'react';
import { formatCurrency } from '../utils/format';

interface BudgetCardProps {
  title: string;
  icon: ReactNode;
  total: number;
  items: { label: string; value: number }[];
  color: string;
  alert?: boolean;
  alertMessage?: string;
}

export function BudgetCard({
  title,
  icon,
  total,
  items,
  color,
  alert,
  alertMessage,
}: BudgetCardProps) {
  return (
    <div className={`
      bg-dark-800 rounded-xl p-5 border transition-all duration-200
      ${alert ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-dark-700 hover:border-dark-600'}
    `}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
            <div style={{ color }}>{icon}</div>
          </div>
          <h3 className="font-semibold text-dark-100">{title}</h3>
        </div>
        <span className="text-xl font-bold" style={{ color }}>
          {formatCurrency(total)}
        </span>
      </div>

      {alert && alertMessage && (
        <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{alertMessage}</p>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
            <span className="text-dark-400">{item.label}</span>
            <span className="font-medium text-dark-200">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
