import { Trash2, Pencil } from 'lucide-react';
import { PARTAGE_CATEGORIES } from '../../constants';

const getCatConfig = (catId) => PARTAGE_CATEGORIES.find(c => c.id === catId) || PARTAGE_CATEGORIES[PARTAGE_CATEGORIES.length - 1];

export const PartageExpenseList = ({ expenses, onEdit, onDelete, filterCat, setFilterCat }) => {
  // Sort by date descending
  const sorted = [...expenses].sort((a, b) => {
    const [da, ma, ya] = a.date.split('/').map(Number);
    const [db, mb, yb] = b.date.split('/').map(Number);
    return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da);
  });

  const filtered = filterCat ? sorted.filter(e => e.categorie === filterCat) : sorted;

  return (
    <div className="card p-4 animate-slideUp stagger-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-heading">
          Dépenses du mois
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterCat(null)}
            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
              !filterCat
                ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/20'
                : 'text-text-muted hover:text-text-secondary bg-surface-200 border border-border-subtle'
            }`}
          >
            Tout
          </button>
          {PARTAGE_CATEGORIES.slice(0, 4).map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(filterCat === cat.id ? null : cat.id)}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                filterCat === cat.id
                  ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/20'
                  : 'text-text-muted hover:text-text-secondary bg-surface-200 border border-border-subtle'
              }`}
              title={cat.label}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🤝</div>
          <p className="text-text-muted text-sm">
            {expenses.length === 0
              ? 'Aucune dépense partagée ce mois-ci'
              : 'Aucune dépense dans cette catégorie'}
          </p>
          <p className="text-text-muted text-xs mt-1">
            Ajoutez une dépense avec le formulaire ci-dessus
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((exp, idx) => {
            const cat = getCatConfig(exp.categorie);
            const maPart = exp.montant * exp.ratio;
            const partConjoint = exp.montant * (1 - exp.ratio);

            return (
              <div
                key={exp.id}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-surface-100 transition-all duration-200 border border-transparent hover:border-border-subtle"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                {/* Catégorie icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  {cat.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {exp.description}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      exp.payePar === 'moi'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      {exp.payePar === 'moi' ? 'Moi' : 'Conjoint(e)'}
                    </span>
                    {exp.ratio !== 0.5 && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full font-medium">
                        {Math.round(exp.ratio * 100)}/{Math.round((1 - exp.ratio) * 100)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-text-muted">{exp.date}</span>
                    <span className="text-[10px] text-text-muted">
                      Ma part: <span className="text-text-secondary font-medium tabular-nums">{maPart.toFixed(2)}€</span>
                    </span>
                    <span className="text-[10px] text-text-muted">
                      Conjoint(e): <span className="text-text-secondary font-medium tabular-nums">{partConjoint.toFixed(2)}€</span>
                    </span>
                  </div>
                </div>

                {/* Montant */}
                <span className="text-sm font-bold text-text-heading tabular-nums flex-shrink-0">
                  {exp.montant.toFixed(2)} €
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                  <button
                    onClick={() => onEdit(exp)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(exp.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
