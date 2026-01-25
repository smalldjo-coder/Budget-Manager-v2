import { useBudgetStore } from '../store/budgetStore';
import { formatCurrency } from '../utils/format';
import { Target, TrendingUp } from 'lucide-react';

export function ObjectivesCard() {
  const { objectifs, setObjectifs } = useBudgetStore();

  const lepProgress = (objectifs.lepCurrent / objectifs.lepTarget) * 100;
  const peaProgress = (objectifs.peaCurrent / objectifs.peaTarget) * 100;

  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
      <h3 className="text-lg font-semibold text-dark-100 mb-6 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary-400" />
        Objectifs Patrimoine
      </h3>

      <div className="space-y-6">
        {/* LEP */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-dark-200 font-medium">Livret LEP</span>
            <span className="text-dark-400 text-sm">
              {formatCurrency(objectifs.lepCurrent)} / {formatCurrency(objectifs.lepTarget)}
            </span>
          </div>
          <div className="relative h-3 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.min(lepProgress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <input
              type="number"
              value={objectifs.lepCurrent}
              onChange={(e) => setObjectifs({ lepCurrent: parseFloat(e.target.value) || 0 })}
              className="w-32 px-3 py-1 bg-dark-700 border border-dark-600 rounded text-dark-100 text-sm"
              placeholder="Montant actuel"
            />
            <span className={`text-sm font-medium ${lepProgress >= 100 ? 'text-green-400' : 'text-blue-400'}`}>
              {lepProgress.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* PEA */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-dark-200 font-medium">Placement PEA</span>
            <span className="text-dark-400 text-sm">
              {formatCurrency(objectifs.peaCurrent)} / {formatCurrency(objectifs.peaTarget)}
            </span>
          </div>
          <div className="relative h-3 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all duration-500"
              style={{ width: `${Math.min(peaProgress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <input
              type="number"
              value={objectifs.peaCurrent}
              onChange={(e) => setObjectifs({ peaCurrent: parseFloat(e.target.value) || 0 })}
              className="w-32 px-3 py-1 bg-dark-700 border border-dark-600 rounded text-dark-100 text-sm"
              placeholder="Montant actuel"
            />
            <span className={`text-sm font-medium ${peaProgress >= 100 ? 'text-green-400' : 'text-purple-400'}`}>
              {peaProgress.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              <span className="text-dark-200 font-medium">Total Patrimoine</span>
            </div>
            <span className="text-xl font-bold text-primary-400">
              {formatCurrency(objectifs.lepCurrent + objectifs.peaCurrent)}
            </span>
          </div>
          <p className="text-dark-500 text-sm mt-2">
            Objectif total: {formatCurrency(objectifs.lepTarget + objectifs.peaTarget)}
          </p>
        </div>
      </div>
    </div>
  );
}
