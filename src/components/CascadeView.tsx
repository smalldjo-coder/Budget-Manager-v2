import { useBudgetStore } from '../store/budgetStore';
import { formatCurrency } from '../utils/format';
import { ArrowDown, TrendingUp, Home, CreditCard, PiggyBank, Heart, Wallet } from 'lucide-react';

export function CascadeView() {
  const { calculateBudget } = useBudgetStore();
  const budget = calculateBudget();

  const steps = [
    {
      label: 'Chiffre d\'Affaires',
      value: budget.ca,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
    },
    {
      label: 'Après Besoins',
      value: budget.soldeApresBesoins,
      subtract: budget.totalBesoins,
      icon: <Home className="w-5 h-5" />,
      color: budget.soldeApresBesoins >= 0 ? 'text-blue-400' : 'text-red-400',
      bgColor: budget.soldeApresBesoins >= 0 ? 'bg-blue-500/20' : 'bg-red-500/20',
      borderColor: budget.soldeApresBesoins >= 0 ? 'border-blue-500/30' : 'border-red-500/30',
    },
    {
      label: 'Après Dettes',
      value: budget.soldeApresDettes,
      subtract: budget.totalDettes,
      icon: <CreditCard className="w-5 h-5" />,
      color: budget.soldeApresDettes >= 0 ? 'text-amber-400' : 'text-red-400',
      bgColor: budget.soldeApresDettes >= 0 ? 'bg-amber-500/20' : 'bg-red-500/20',
      borderColor: budget.soldeApresDettes >= 0 ? 'border-amber-500/30' : 'border-red-500/30',
      alert: budget.alerteDettes,
    },
    {
      label: 'Après Épargne',
      value: budget.soldeApresEpargne,
      subtract: budget.totalEpargne,
      icon: <PiggyBank className="w-5 h-5" />,
      color: budget.soldeApresEpargne >= 0 ? 'text-cyan-400' : 'text-red-400',
      bgColor: budget.soldeApresEpargne >= 0 ? 'bg-cyan-500/20' : 'bg-red-500/20',
      borderColor: budget.soldeApresEpargne >= 0 ? 'border-cyan-500/30' : 'border-red-500/30',
    },
    {
      label: 'Après Envies',
      value: budget.soldeFinal,
      subtract: budget.totalEnvies,
      icon: <Heart className="w-5 h-5" />,
      color: budget.soldeFinal >= 0 ? 'text-purple-400' : 'text-red-400',
      bgColor: budget.soldeFinal >= 0 ? 'bg-purple-500/20' : 'bg-red-500/20',
      borderColor: budget.soldeFinal >= 0 ? 'border-purple-500/30' : 'border-red-500/30',
    },
  ];

  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
      <h3 className="text-lg font-semibold text-dark-100 mb-6 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-primary-400" />
        Calcul en cascade
      </h3>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.label}>
            <div className={`
              p-4 rounded-lg border transition-all duration-200
              ${step.bgColor} ${step.borderColor}
              ${step.alert ? 'ring-2 ring-red-500/50' : ''}
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={step.color}>{step.icon}</div>
                  <div>
                    <span className="text-dark-200 font-medium">{step.label}</span>
                    {step.subtract !== undefined && (
                      <span className="text-dark-500 text-sm ml-2">
                        (- {formatCurrency(step.subtract)})
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-xl font-bold ${step.color}`}>
                  {formatCurrency(step.value)}
                </span>
              </div>
              {step.alert && (
                <p className="text-red-400 text-sm mt-2">
                  Attention: Dettes &gt; 10% du revenu d&apos;activité
                </p>
              )}
            </div>

            {index < steps.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="w-4 h-4 text-dark-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-dark-700">
        <div className={`
          text-center p-4 rounded-lg
          ${budget.soldeFinal >= 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}
        `}>
          <p className="text-dark-400 text-sm mb-1">Solde Final</p>
          <p className={`text-3xl font-bold ${budget.soldeFinal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(budget.soldeFinal)}
          </p>
        </div>
      </div>
    </div>
  );
}
