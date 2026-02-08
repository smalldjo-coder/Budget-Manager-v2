import { getZone } from "../../constants/zones";

export const StatusIndicator = ({ label, pct, zones, compact = false }) => {
  const zone = getZone(pct, zones);
  const pctValue = Math.min(pct * 100, 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className={`font-semibold ${zone.textColor}`}>{zone.label}</span>
        <span className="text-gray-500 italic truncate">{zone.advice}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 rounded-lg animate-fadeIn" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className={`text-sm font-bold ${zone.textColor}`}>
          {(pct * 100).toFixed(1)}% — {zone.label}
        </span>
      </div>

      <div className="relative h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-selected)' }}>
        <div className="absolute inset-0 flex">
          {zones.map((z, i) => {
            const prevMax = zones[i - 1]?.max || 0;
            const width = z.max - prevMax;
            return (
              <div
                key={i}
                className={`h-full ${z.bgColor} opacity-30`}
                style={{ width: `${width}%` }}
              />
            );
          })}
        </div>
        <div
          className="absolute top-0 h-full w-0.5 bg-white shadow-lg transition-all duration-300 rounded-full"
          style={{ left: `${Math.min(pctValue, 99)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        <span>0%</span>
        {zones.slice(0, -1).map((z, i) => (
          <span key={i}>{z.max}%</span>
        ))}
        <span>100%</span>
      </div>

      <p className="text-xs mt-1 italic" style={{ color: 'var(--text-secondary)' }}>{zone.advice}</p>
    </div>
  );
};
