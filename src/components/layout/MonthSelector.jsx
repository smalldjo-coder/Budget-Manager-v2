import { MONTHS } from "../../constants";
import { useBudgetStore } from "../../store";

export const MonthSelector = ({ allMonthsCalculs }) => {
  const currentMonth = useBudgetStore(s => s.currentMonth);
  const setCurrentMonth = useBudgetStore(s => s.setCurrentMonth);

  return (
    <>
      {/* Sélecteur de mois - Desktop */}
      <div className="hidden sm:flex justify-center gap-1.5 mb-4 flex-wrap">
        {MONTHS.map((m, idx) => {
          const hasData = allMonthsCalculs[idx].ca > 0 || allMonthsCalculs[idx].besoins > 0;
          return (
            <button key={m} onClick={() => setCurrentMonth(idx)}
              className={"px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 " + (currentMonth === idx ? "text-white" : "")}
              style={currentMonth === idx ? { backgroundColor: 'var(--accent-blue)' } : hasData ? { backgroundColor: 'var(--bg-selected)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' } : { backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
              {m.substring(0, 3)}
              {hasData && <span className="ml-1" style={{ color: 'var(--accent-emerald)' }}>•</span>}
            </button>
          );
        })}
      </div>

      {/* Sélecteur de mois - Mobile (grille 4x3) */}
      <div className="sm:hidden grid grid-cols-4 gap-1.5 mb-4">
        {MONTHS.map((m, idx) => {
          const hasData = allMonthsCalculs[idx].ca > 0 || allMonthsCalculs[idx].besoins > 0;
          return (
            <button key={m} onClick={() => setCurrentMonth(idx)}
              className={"py-2 rounded-lg text-xs font-medium transition-all " + (currentMonth === idx ? "text-white" : "")}
              style={currentMonth === idx ? { backgroundColor: 'var(--accent-blue)' } : hasData ? { backgroundColor: 'var(--bg-selected)', color: 'var(--text-primary)' } : { backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
              {m.substring(0, 3)}
              {hasData && <span className="ml-0.5" style={{ color: 'var(--accent-emerald)' }}>•</span>}
            </button>
          );
        })}
      </div>
    </>
  );
};
