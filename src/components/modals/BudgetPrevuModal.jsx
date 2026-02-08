import { TrendingUp, Home, CreditCard, PiggyBank, Gift } from "lucide-react";
import { Modal } from "../ui/Modal";
import { formatMoney } from "../../utils/formatters";
import { useBudgetStore } from "../../store";

export const BudgetPrevuModal = () => {
  const selectedYear = useBudgetStore(s => s.selectedYear);
  const showBudgetPrevu = useBudgetStore(s => s.showBudgetPrevu);
  const setShowBudgetPrevu = useBudgetStore(s => s.setShowBudgetPrevu);
  const budgetPrevu = useBudgetStore(s => s.budgetPrevu);
  const updateBudgetPrevu = useBudgetStore(s => s.updateBudgetPrevu);
  const resetBudgetPrevu = useBudgetStore(s => s.resetBudgetPrevu);
  const showNotification = useBudgetStore(s => s.showNotification);

  return (
    <Modal isOpen={showBudgetPrevu} onClose={() => setShowBudgetPrevu(false)} title={`Budget Prévisionnel — ${selectedYear}`} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">Définissez vos objectifs mensuels pour comparer avec le réalisé.</p>

        <div className="card-inset p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--accent-emerald)' }}>
            <TrendingUp className="w-4 h-4" />
            Revenus mensuels prévus
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Activité</label>
              <input type="number" value={budgetPrevu.revenus.activite} onChange={e => updateBudgetPrevu(prev => ({ ...prev, revenus: { ...prev.revenus, activite: parseFloat(e.target.value) || 0 } }))}
                className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Sociaux</label>
              <input type="number" value={budgetPrevu.revenus.sociaux} onChange={e => updateBudgetPrevu(prev => ({ ...prev, revenus: { ...prev.revenus, sociaux: parseFloat(e.target.value) || 0 } }))}
                className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Intérêts</label>
              <input type="number" value={budgetPrevu.revenus.interets} onChange={e => updateBudgetPrevu(prev => ({ ...prev, revenus: { ...prev.revenus, interets: parseFloat(e.target.value) || 0 } }))}
                className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="mt-2 text-right text-green-400 text-sm font-semibold">
            Total mensuel: {formatMoney(budgetPrevu.revenus.activite + budgetPrevu.revenus.sociaux + budgetPrevu.revenus.interets)}
          </div>
        </div>

        <div className="card-inset p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Home className="w-4 h-4" />
            Besoins mensuels prévus
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Fixes</label>
              <input type="number" value={budgetPrevu.besoins.fixes} onChange={e => updateBudgetPrevu(prev => ({ ...prev, besoins: { ...prev.besoins, fixes: parseFloat(e.target.value) || 0 } }))}
                className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Variables</label>
              <input type="number" value={budgetPrevu.besoins.variables} onChange={e => updateBudgetPrevu(prev => ({ ...prev, besoins: { ...prev.besoins, variables: parseFloat(e.target.value) || 0 } }))}
                className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="mt-2 text-right text-gray-300 text-sm font-semibold">
            Total mensuel: {formatMoney(budgetPrevu.besoins.fixes + budgetPrevu.besoins.variables)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card-inset p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--accent-blue)' }}>
              <CreditCard className="w-4 h-4" />
              Dettes
            </h4>
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total mensuel</label>
            <input type="number" value={budgetPrevu.dettes.total} onChange={e => updateBudgetPrevu(prev => ({ ...prev, dettes: { total: parseFloat(e.target.value) || 0 } }))}
              className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
          </div>
          <div className="card-inset p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--accent-amber)' }}>
              <PiggyBank className="w-4 h-4" />
              Épargne
            </h4>
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total mensuel</label>
            <input type="number" value={budgetPrevu.epargne.total} onChange={e => updateBudgetPrevu(prev => ({ ...prev, epargne: { total: parseFloat(e.target.value) || 0 } }))}
              className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
          </div>
          <div className="card-inset p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--accent-rose)' }}>
              <Gift className="w-4 h-4" />
              Envies
            </h4>
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total mensuel</label>
            <input type="number" value={budgetPrevu.envies.total} onChange={e => updateBudgetPrevu(prev => ({ ...prev, envies: { total: parseFloat(e.target.value) || 0 } }))}
              className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        <div className="bg-indigo-900 rounded-lg p-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-indigo-300 font-semibold">Solde mensuel prévu</span>
            <span className={`font-bold ${(budgetPrevu.revenus.activite + budgetPrevu.revenus.sociaux + budgetPrevu.revenus.interets - budgetPrevu.besoins.fixes - budgetPrevu.besoins.variables - budgetPrevu.dettes.total - budgetPrevu.epargne.total - budgetPrevu.envies.total) >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatMoney(budgetPrevu.revenus.activite + budgetPrevu.revenus.sociaux + budgetPrevu.revenus.interets - budgetPrevu.besoins.fixes - budgetPrevu.besoins.variables - budgetPrevu.dettes.total - budgetPrevu.epargne.total - budgetPrevu.envies.total)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
            <span>Projection annuelle</span>
            <span>{formatMoney((budgetPrevu.revenus.activite + budgetPrevu.revenus.sociaux + budgetPrevu.revenus.interets - budgetPrevu.besoins.fixes - budgetPrevu.besoins.variables - budgetPrevu.dettes.total - budgetPrevu.epargne.total - budgetPrevu.envies.total) * 12)}</span>
          </div>
        </div>

        <button onClick={() => { if (window.confirm("Réinitialiser le budget prévisionnel ?")) { resetBudgetPrevu(); showNotification("Budget prévisionnel réinitialisé", "success"); } }}
          className="w-full py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm">
          Réinitialiser
        </button>
      </div>
    </Modal>
  );
};
