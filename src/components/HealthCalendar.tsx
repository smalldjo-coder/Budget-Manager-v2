import { useBudgetStore } from '../store/budgetStore';
import { Calendar } from 'lucide-react';

const MONTHS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
];

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function getHealthColor(solde: number, ca: number): string {
  if (ca === 0) return 'bg-dark-700';
  const ratio = solde / ca;
  if (ratio >= 0.1) return 'bg-green-500';
  if (ratio >= 0) return 'bg-green-400/60';
  if (ratio >= -0.1) return 'bg-amber-500';
  return 'bg-red-500';
}

function getHealthLabel(solde: number, ca: number): string {
  if (ca === 0) return 'Pas de données';
  const ratio = solde / ca;
  if (ratio >= 0.1) return 'Excellent';
  if (ratio >= 0) return 'Bon';
  if (ratio >= -0.1) return 'Attention';
  return 'Critique';
}

export function HealthCalendar() {
  const { monthlyHistory, selectedYear, setSelectedMonth, setSelectedYear } = useBudgetStore();

  const getMonthData = (monthIndex: number) => {
    const monthName = MONTH_NAMES[monthIndex];
    return monthlyHistory.find(m => m.month === monthName && m.year === selectedYear);
  };

  const calculateMonthHealth = (monthIndex: number) => {
    const data = getMonthData(monthIndex);
    if (!data) return { solde: 0, ca: 0 };

    const ca = data.revenus.activite + data.revenus.sociaux + data.revenus.interets;
    const totalDepenses =
      data.besoins.fixes + data.besoins.variables +
      data.dettes.creditImmo + data.dettes.creditAuto + data.dettes.autres +
      data.epargne.livretLEP + data.epargne.placementPEA + data.epargne.investPersonnel +
      data.envies.fourmilles + data.envies.occasionnel;
    const solde = ca - totalDepenses;

    return { solde, ca };
  };

  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-400" />
          Santé budgétaire 12 mois
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="px-3 py-1 text-dark-400 hover:text-dark-100 transition-colors"
          >
            &lt;
          </button>
          <span className="text-dark-200 font-medium min-w-[60px] text-center">
            {selectedYear}
          </span>
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            className="px-3 py-1 text-dark-400 hover:text-dark-100 transition-colors"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {MONTHS.map((month, index) => {
          const { solde, ca } = calculateMonthHealth(index);
          const hasData = ca > 0;

          return (
            <button
              key={month}
              onClick={() => setSelectedMonth(index)}
              className={`
                p-3 rounded-lg text-center transition-all duration-200
                hover:ring-2 hover:ring-primary-500/50
                ${getHealthColor(solde, ca)}
              `}
              title={`${MONTH_NAMES[index]}: ${getHealthLabel(solde, ca)}`}
            >
              <span className={`text-sm font-medium ${hasData ? 'text-white' : 'text-dark-400'}`}>
                {month}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-dark-400">Excellent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-400/60" />
          <span className="text-dark-400">Bon</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-dark-400">Attention</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-dark-400">Critique</span>
        </div>
      </div>
    </div>
  );
}
