import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { PARTAGE_CATEGORIES } from '../../constants';

const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export const PartageForm = ({ onSubmit, editingExpense, onCancelEdit, currentMonth }) => {
  const defaultState = {
    date: today(),
    description: '',
    montant: '',
    payePar: 'moi',
    ratio: 0.5,
    categorie: 'alimentation',
  };

  const [form, setForm] = useState(
    editingExpense
      ? { ...editingExpense, montant: String(editingExpense.montant) }
      : defaultState
  );
  const [showRatioSlider, setShowRatioSlider] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.montant || parseFloat(form.montant) <= 0) return;

    onSubmit({
      date: form.date,
      description: form.description.trim(),
      montant: parseFloat(form.montant),
      payePar: form.payePar,
      ratio: form.ratio,
      categorie: form.categorie,
      mois: currentMonth,
    });

    if (!editingExpense) {
      setForm(defaultState);
    }
  };

  const handleCancel = () => {
    setForm(defaultState);
    onCancelEdit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 animate-slideUp stagger-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent-purple/15 flex items-center justify-center">
          <Plus className="w-4 h-4 text-accent-purple" />
        </div>
        <h3 className="text-sm font-semibold text-text-heading">
          {editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense partagée'}
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {/* Date */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1 block">Date</label>
          <input
            type="text"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            placeholder="JJ/MM/AAAA"
            className="w-full bg-surface-200 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="col-span-2 sm:col-span-1">
          <label className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1 block">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ex: Courses Carrefour"
            className="w-full bg-surface-200 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>

        {/* Montant */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1 block">Montant (€)</label>
          <input
            type="number"
            value={form.montant}
            onChange={(e) => setForm({ ...form, montant: e.target.value })}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full bg-surface-200 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none tabular-nums"
          />
        </div>

        {/* Catégorie */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1 block">Catégorie</label>
          <select
            value={form.categorie}
            onChange={(e) => setForm({ ...form, categorie: e.target.value })}
            className="w-full bg-surface-200 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none cursor-pointer"
          >
            {PARTAGE_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Payé par + Ratio + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Toggle Payé par */}
        <div className="flex items-center gap-1 bg-surface-200 rounded-lg p-0.5 border border-border-subtle">
          <button
            type="button"
            onClick={() => setForm({ ...form, payePar: 'moi' })}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              form.payePar === 'moi'
                ? 'bg-accent-blue text-white shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Payé par moi
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, payePar: 'conjoint' })}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              form.payePar === 'conjoint'
                ? 'bg-accent-purple text-white shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Payé par conjoint(e)
          </button>
        </div>

        {/* Ratio toggle */}
        <button
          type="button"
          onClick={() => setShowRatioSlider(!showRatioSlider)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            form.ratio !== 0.5
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-surface-200 border-border-subtle text-text-muted hover:text-text-secondary'
          }`}
        >
          {Math.round(form.ratio * 100)}/{Math.round((1 - form.ratio) * 100)}
        </button>

        <div className="flex-1" />

        {/* Actions */}
        {editingExpense && (
          <button type="button" onClick={handleCancel} className="btn-ghost text-xs">
            <X className="w-3.5 h-3.5" /> Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={!form.description.trim() || !form.montant || parseFloat(form.montant) <= 0}
          className="btn-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-3.5 h-3.5" />
          {editingExpense ? 'Modifier' : 'Ajouter'}
        </button>
      </div>

      {/* Slider ratio (expandable) */}
      {showRatioSlider && (
        <div className="mt-3 pt-3 border-t border-border-subtle animate-slideUp">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">Ma part : <span className="text-text-primary font-semibold">{Math.round(form.ratio * 100)}%</span></span>
            <span className="text-xs text-text-muted">Conjoint(e) : <span className="text-text-primary font-semibold">{Math.round((1 - form.ratio) * 100)}%</span></span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={form.ratio * 100}
            onChange={(e) => setForm({ ...form, ratio: parseInt(e.target.value) / 100 })}
            className="w-full"
          />
          <div className="flex justify-center gap-2 mt-2">
            {[0.5, 0.6, 0.7, 0.33].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, ratio: r })}
                className={`px-2 py-1 rounded text-[10px] font-medium border transition-all ${
                  form.ratio === r
                    ? 'bg-accent-purple/15 border-accent-purple/30 text-accent-purple'
                    : 'bg-surface-200 border-border-subtle text-text-muted hover:text-text-secondary'
                }`}
              >
                {Math.round(r * 100)}/{Math.round((1 - r) * 100)}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};
