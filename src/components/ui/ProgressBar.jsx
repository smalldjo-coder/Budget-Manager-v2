export const ProgressBar = ({ label, current, target, icon: Icon, formatMoney }) => {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
          {Icon && <Icon className="w-3 h-3" />}
          {label}
        </span>
        <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>{formatMoney(current)} / {formatMoney(target)}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-selected)' }}>
        <div className="h-full rounded-full progress-bar" style={{ width: pct + "%", backgroundColor: current >= target ? 'var(--accent-emerald)' : 'var(--accent-blue)' }} />
      </div>
      <div className="text-right text-xs mt-1">
        <span className="tabular-nums font-medium" style={{ color: current >= target ? 'var(--accent-emerald)' : 'var(--accent-blue)' }}>{pct.toFixed(1)}%</span>
      </div>
    </div>
  );
};
