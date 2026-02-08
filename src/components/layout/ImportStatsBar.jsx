import { Smartphone, X } from "lucide-react";
import { useBudgetStore } from "../../store";

export const ImportStatsBar = () => {
  const importStats = useBudgetStore(s => s.importStats);
  const setImportStats = useBudgetStore(s => s.setImportStats);

  if (!importStats) return null;

  return (
    <div className="rounded-xl p-3.5 mb-4 border animate-slideDown" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', borderColor: 'rgba(139, 92, 246, 0.15)' }}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--accent-purple)' }}>Dernier import iCompta</span>
          <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>{importStats.mapped}/{importStats.total} transactions • {importStats.unmapped} non mappées</span>
        </div>
        <button onClick={() => setImportStats(null)} className="rounded-lg p-1 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
