import { Target, Scale, Bell, BellOff } from "lucide-react";
import { Modal } from "../ui/Modal";
import { useBudgetStore } from "../../store";

export const SettingsModal = () => {
  const showSettings = useBudgetStore(s => s.showSettings);
  const setShowSettings = useBudgetStore(s => s.setShowSettings);
  const objectifs = useBudgetStore(s => s.objectifs);
  const updateObjectifs = useBudgetStore(s => s.updateObjectifs);
  const resetObjectifs = useBudgetStore(s => s.resetObjectifs);
  const showNotification = useBudgetStore(s => s.showNotification);

  return (
    <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Paramètres & Objectifs">
      <div className="space-y-4">
        <div className="card-inset p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            Objectifs Patrimoine
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>LEP (€)</label>
              <input type="number" value={objectifs.lep} onChange={e => updateObjectifs({ lep: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>PEA (€)</label>
              <input type="number" value={objectifs.pea} onChange={e => updateObjectifs({ pea: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>

        <div className="card-inset p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-400" />
            Seuils d'alerte
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Seuil max dettes (%)</label>
              <input type="number" min="0" max="100" value={objectifs.seuilDettes} onChange={e => updateObjectifs({ seuilDettes: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Épargne min (%)</label>
                <input type="number" min="0" max="100" value={objectifs.epargneMin} onChange={e => updateObjectifs({ epargneMin: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Épargne max (%)</label>
                <input type="number" min="0" max="100" value={objectifs.epargneMax} onChange={e => updateObjectifs({ epargneMax: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Envies min (%)</label>
                <input type="number" min="0" max="100" value={objectifs.enviesMin} onChange={e => updateObjectifs({ enviesMin: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Envies max (%)</label>
                <input type="number" min="0" max="100" value={objectifs.enviesMax} onChange={e => updateObjectifs({ enviesMax: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-right text-sm font-medium tabular-nums" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card-inset p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={objectifs.alertesActives} onChange={e => updateObjectifs({ alertesActives: e.target.checked })}
              className="w-4 h-4 rounded bg-gray-600 border-gray-500" />
            <span className="text-sm flex items-center gap-2">
              {objectifs.alertesActives ? <Bell className="w-4 h-4 text-green-400" /> : <BellOff className="w-4 h-4 text-gray-400" />}
              Alertes actives
            </span>
          </label>
        </div>

        <button onClick={() => { if (window.confirm("Réinitialiser tous les paramètres par défaut ?")) { resetObjectifs(); showNotification("Paramètres réinitialisés", "success"); } }}
          className="w-full py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm">
          Réinitialiser par défaut
        </button>
      </div>
    </Modal>
  );
};
