import { Check, AlertTriangle } from "lucide-react";

export const Gauge = ({ label, value, thresholdLow, thresholdHigh, icon: Icon, color }) => {
  const pct = Math.min(Math.max(value, 0), 100);
  const isOk = (thresholdLow === undefined || value >= thresholdLow) && (thresholdHigh === undefined || value <= thresholdHigh);
  const gaugeColor = isOk ? "#34d399" : "#f43f5e";
  const circ = 2 * Math.PI * 36;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle cx="40" cy="40" r="36" stroke="var(--border-default)" strokeWidth="5" fill="none" />
          <circle cx="40" cy="40" r="36" stroke={gaugeColor} strokeWidth="5" fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="gauge-circle" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold tabular-nums" style={{ color: gaugeColor }}>{value.toFixed(1)}%</span>
        </div>
      </div>
      <div className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
        {Icon && <Icon className="w-3 h-3" style={{ color }} />}
        {label}
      </div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {thresholdLow !== undefined && thresholdHigh !== undefined ? thresholdLow + "-" + thresholdHigh + "%" : thresholdHigh !== undefined ? "≤" + thresholdHigh + "%" : "≥" + thresholdLow + "%"}
      </div>
      <div className={"text-xs font-semibold flex items-center gap-1 " + (isOk ? "text-green-500" : "text-red-500")}>
        {isOk ? <><Check className="w-3 h-3" /> OK</> : <><AlertTriangle className="w-3 h-3" /> Alerte</>}
      </div>
    </div>
  );
};
