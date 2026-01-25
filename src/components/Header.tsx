import { Wallet, RefreshCw, Save } from 'lucide-react';
import { useBudgetStore } from '../store/budgetStore';
import { ExportButton } from './ExportButton';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function Header() {
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, saveCurrentMonth, resetBudget } = useBudgetStore();

  return (
    <header className="bg-dark-900 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/20 rounded-xl">
              <Wallet className="w-8 h-8 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark-100">Budget Manager 2025</h1>
              <p className="text-dark-400 text-sm">Méthode des enveloppes</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month/Year Selector */}
            <div className="flex items-center gap-2 bg-dark-800 rounded-lg p-1">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent text-dark-100 px-3 py-2 rounded-md hover:bg-dark-700 transition-colors cursor-pointer"
              >
                {MONTH_NAMES.map((month, index) => (
                  <option key={month} value={index} className="bg-dark-800">
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-dark-100 px-3 py-2 rounded-md hover:bg-dark-700 transition-colors cursor-pointer"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year} className="bg-dark-800">
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <button
              onClick={saveCurrentMonth}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Sauvegarder</span>
            </button>

            <ExportButton />

            <button
              onClick={resetBudget}
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
