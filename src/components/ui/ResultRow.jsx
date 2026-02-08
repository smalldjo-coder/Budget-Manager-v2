import { AlertTriangle, Eye } from "lucide-react";

export const ResultRow = ({ label, value, pct, alert, alertMessage, target, highlight, formatMoney, formatPct, onClick }) => (
  <div className={"mt-1.5 pt-1.5 " + (highlight ? "-mx-4 px-4 py-1.5 rounded-lg" : "") + (onClick ? " cursor-pointer" : "")} style={{ borderTop: '1px solid var(--border-subtle)', ...(highlight ? { backgroundColor: 'var(--bg-input)' } : {}) }} onClick={onClick}>
    <div className="flex justify-between items-center text-xs">
      <span className={highlight ? "font-semibold" : ""} style={{ color: 'var(--text-secondary)' }}>
        {label}
        {onClick && <Eye className="w-3 h-3 inline ml-1" style={{ color: 'var(--text-muted)' }} />}
      </span>
      <div className="text-right">
        <span className={"font-semibold tabular-nums " + (value < 0 ? "text-red-400" : "")}>{formatMoney(value)}</span>
        {pct !== undefined && (
          <span className={"ml-1 " + (alert ? "text-red-400" : "")} style={!alert ? { color: 'var(--text-muted)' } : {}}>
            ({formatPct(pct)})
            {alert && <span className="ml-1 flex items-center gap-0.5 inline-flex"><AlertTriangle className="w-3 h-3" />{alertMessage}</span>}
            {target && !alert && <span className="ml-1" style={{ color: 'var(--text-muted)' }}>cible: {target}</span>}
          </span>
        )}
      </div>
    </div>
  </div>
);
