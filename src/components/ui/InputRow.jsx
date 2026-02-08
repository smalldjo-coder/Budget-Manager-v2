import { round2 } from "../../utils/formatters";

export const InputRow = ({ label, icon: Icon, value, onChange, className = "" }) => (
  <div className={"flex justify-between items-center gap-2 " + className}>
    <label className="text-xs font-medium flex items-center gap-1.5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span className="truncate">{label}</span>
    </label>
    <input
      type="number"
      defaultValue={value ? round2(value) : ""}
      onBlur={e => onChange(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
      className="w-24 sm:w-28 px-2.5 py-1.5 rounded-lg text-right text-xs font-medium tabular-nums focus:outline-none"
      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
      placeholder="0"
      step="0.01"
    />
  </div>
);
