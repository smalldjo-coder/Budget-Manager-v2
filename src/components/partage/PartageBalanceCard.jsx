import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Equal, ArrowRight } from 'lucide-react';
import { computePartageBalance } from '../../utils/partageCalculations';

export const PartageBalanceCard = ({ expenses }) => {
  const balance = useMemo(() => computePartageBalance(expenses), [expenses]);

  const isEquilibre = Math.abs(balance.solde) < 5;
  const conjointMeDoit = balance.solde > 0;

  const getStatusConfig = () => {
    if (isEquilibre) return {
      color: 'accent-emerald',
      bgClass: 'bg-emerald-500/10 border-emerald-500/20',
      textClass: 'text-emerald-400',
      icon: Equal,
      label: 'Équilibré',
      message: 'Les dépenses sont bien réparties !'
    };
    if (conjointMeDoit) return {
      color: 'accent-blue',
      bgClass: 'bg-blue-500/10 border-blue-500/20',
      textClass: 'text-blue-400',
      icon: TrendingUp,
      label: 'En votre faveur',
      message: `Votre conjoint(e) vous doit`
    };
    return {
      color: 'accent-amber',
      bgClass: 'bg-amber-500/10 border-amber-500/20',
      textClass: 'text-amber-400',
      icon: TrendingDown,
      label: 'À rembourser',
      message: `Vous devez à votre conjoint(e)`
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  const totalPaye = balance.totalPayeMoi + balance.totalPayeConjoint;
  const pctMoi = totalPaye > 0 ? (balance.totalPayeMoi / totalPaye) * 100 : 50;
  const pctConjoint = totalPaye > 0 ? (balance.totalPayeConjoint / totalPaye) * 100 : 50;

  return (
    <div className="card p-5 animate-slideUp">
      {/* Solde principal */}
      <div className={`rounded-xl p-4 border ${status.bgClass} mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${status.textClass}`} />
            <span className={`text-sm font-semibold ${status.textClass}`}>{status.label}</span>
          </div>
          <span className="text-xs text-text-muted tabular-nums">
            {expenses.length} dépense{expenses.length !== 1 ? 's' : ''}
          </span>
        </div>

        {!isEquilibre && (
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${status.textClass} tabular-nums`}>
              {balance.aRembourser.montant.toFixed(2)} €
            </span>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <span>{balance.aRembourser.de === 'moi' ? 'Vous' : 'Conjoint(e)'}</span>
              <ArrowRight className="w-3 h-3" />
              <span>{balance.aRembourser.vers === 'moi' ? 'Vous' : 'Conjoint(e)'}</span>
            </div>
          </div>
        )}

        {isEquilibre && balance.totalDepenses > 0 && (
          <span className={`text-2xl font-bold ${status.textClass} tabular-nums`}>
            0.00 €
          </span>
        )}
      </div>

      {/* Barres de répartition des paiements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary font-medium">Répartition des paiements</span>
          <span className="text-text-muted tabular-nums">{balance.totalDepenses.toFixed(2)} € total</span>
        </div>

        {totalPaye > 0 ? (
          <>
            <div className="flex h-3 rounded-full overflow-hidden bg-surface-200">
              <div
                className="bg-accent-blue transition-all duration-500 ease-out"
                style={{ width: `${pctMoi}%` }}
              />
              <div
                className="bg-accent-purple transition-all duration-500 ease-out"
                style={{ width: `${pctConjoint}%` }}
              />
            </div>

            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-blue" />
                <span className="text-text-secondary">Moi</span>
                <span className="text-text-primary font-semibold tabular-nums">{balance.totalPayeMoi.toFixed(2)} €</span>
                <span className="text-text-muted">({pctMoi.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-purple" />
                <span className="text-text-secondary">Conjoint(e)</span>
                <span className="text-text-primary font-semibold tabular-nums">{balance.totalPayeConjoint.toFixed(2)} €</span>
                <span className="text-text-muted">({pctConjoint.toFixed(0)}%)</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-2 text-text-muted text-xs">
            Aucune dépense enregistrée
          </div>
        )}
      </div>
    </div>
  );
};
