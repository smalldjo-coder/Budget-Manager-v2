import { MONTHS } from "../../constants";
import { useBudgetStore } from "../../store";

export const MonthSelector = ({ allMonthsCalculs }) => {
  const currentMonth = useBudgetStore(s => s.currentMonth);
  const setCurrentMonth = useBudgetStore(s => s.setCurrentMonth);

  return (
    <>
      {/* Sélecteur de mois - Desktop */}
      <div className="hidden sm:flex justify-center gap-2 mb-8 flex-wrap">
        {MONTHS.map((m, idx) => {
          const hasData = allMonthsCalculs[idx].ca > 0 || allMonthsCalculs[idx].besoins > 0;
          return (
            <button key={m} onClick={() => setCurrentMonth(idx)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                currentMonth === idx 
                  ? "bg-accent-blue text-white shadow-glow-blue shadow-md border border-accent-blue/50" 
                  : hasData 
                    ? "bg-surface-200 text-text-primary border border-border-default hover:border-border-strong hover:bg-surface-300" 
                    : "bg-transparent text-text-muted border border-border-subtle hover:text-text-secondary hover:border-border-default hover:bg-surface-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {m}
                {hasData && <span className={`w-1.5 h-1.5 rounded-full ${currentMonth === idx ? 'bg-white' : 'bg-accent-emerald'}`}></span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sélecteur de mois - Mobile (grille 4x3 ou scroll horizontal) */}
      <div className="sm:hidden flex overflow-x-auto gap-2 pb-4 mb-4 snap-x no-scrollbar">
        {MONTHS.map((m, idx) => {
          const hasData = allMonthsCalculs[idx].ca > 0 || allMonthsCalculs[idx].besoins > 0;
          return (
            <button key={m} onClick={() => setCurrentMonth(idx)}
              className={`snap-center shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentMonth === idx 
                  ? "bg-accent-blue text-white shadow-glow-blue border border-accent-blue/50" 
                  : hasData 
                    ? "bg-surface-200 text-text-primary border border-border-default" 
                    : "bg-surface-100 text-text-muted border border-transparent"
              }`}
            >
              <div className="flex items-center gap-1">
                {m.substring(0, 3)}
                {hasData && <span className={`w-1.5 h-1.5 rounded-full ${currentMonth === idx ? 'bg-white' : 'bg-accent-emerald'}`}></span>}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
};
