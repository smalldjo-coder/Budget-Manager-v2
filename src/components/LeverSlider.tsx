import { useBudgetStore } from '../store/budgetStore';
import { formatCurrency, formatPercent } from '../utils/format';
import { PiggyBank, Heart } from 'lucide-react';

export function LeverSlider() {
  const { leverValue, setLeverValue, calculateBudget } = useBudgetStore();
  const budget = calculateBudget();

  const disponible = budget.disponibleRepartition;
  const versEpargne = (disponible * leverValue) / 100;
  const versEnvies = disponible - versEpargne;

  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
      <h3 className="text-lg font-semibold text-dark-100 mb-4">
        Levier de répartition
      </h3>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-dark-400">Disponible à répartir</span>
          <span className="text-xl font-bold text-primary-400">
            {formatCurrency(disponible)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-blue-400" />
            <span className="text-dark-200">Épargne</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-blue-400">{formatCurrency(versEpargne)}</span>
            <span className="text-dark-500 ml-2">({formatPercent(leverValue)})</span>
          </div>
        </div>

        <div className="relative">
          <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200"
              style={{ width: `${leverValue}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={leverValue}
            onChange={(e) => setLeverValue(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-primary-500 transition-all duration-200 pointer-events-none"
            style={{ left: `calc(${leverValue}% - 10px)` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-400" />
            <span className="text-dark-200">Envies</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-purple-400">{formatCurrency(versEnvies)}</span>
            <span className="text-dark-500 ml-2">({formatPercent(100 - leverValue)})</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-dark-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-dark-700/50 rounded-lg">
            <p className="text-dark-400 mb-1">Cible Épargne</p>
            <p className="font-medium text-dark-200">5-20% du CA</p>
            <p className={`text-xs mt-1 ${budget.epargnePercentage >= 5 && budget.epargnePercentage <= 20 ? 'text-green-400' : 'text-amber-400'}`}>
              Actuel: {formatPercent(budget.epargnePercentage)}
            </p>
          </div>
          <div className="text-center p-3 bg-dark-700/50 rounded-lg">
            <p className="text-dark-400 mb-1">Cible Envies</p>
            <p className="font-medium text-dark-200">10-30% du CA</p>
            <p className={`text-xs mt-1 ${budget.enviesPercentage >= 10 && budget.enviesPercentage <= 30 ? 'text-green-400' : 'text-amber-400'}`}>
              Actuel: {formatPercent(budget.enviesPercentage)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
