import { PARTAGE_CATEGORIES } from '../constants';

/**
 * Calcule le bilan de partage pour une liste de dépenses.
 * @param {Array} expenses - Liste des dépenses partagées
 * @returns {Object} Bilan détaillé
 */
export function computePartageBalance(expenses) {
  if (!expenses || expenses.length === 0) {
    return {
      totalDepenses: 0,
      totalPayeMoi: 0,
      totalPayeConjoint: 0,
      partMoi: 0,
      partConjoint: 0,
      solde: 0,
      aRembourser: { montant: 0, de: null, vers: null },
    };
  }

  let totalPayeMoi = 0;
  let totalPayeConjoint = 0;
  let partMoi = 0;
  let partConjoint = 0;

  for (const exp of expenses) {
    const maPartMontant = exp.montant * exp.ratio;
    const partConjointMontant = exp.montant * (1 - exp.ratio);

    partMoi += maPartMontant;
    partConjoint += partConjointMontant;

    if (exp.payePar === 'moi') {
      totalPayeMoi += exp.montant;
    } else {
      totalPayeConjoint += exp.montant;
    }
  }

  const totalDepenses = totalPayeMoi + totalPayeConjoint;

  // Solde positif = le conjoint me doit de l'argent
  // Solde négatif = je dois de l'argent au conjoint
  const solde = totalPayeMoi - partMoi;

  const aRembourser = {
    montant: Math.abs(solde),
    de: solde < 0 ? 'moi' : 'conjoint',
    vers: solde < 0 ? 'conjoint' : 'moi',
  };

  return {
    totalDepenses: round2(totalDepenses),
    totalPayeMoi: round2(totalPayeMoi),
    totalPayeConjoint: round2(totalPayeConjoint),
    partMoi: round2(partMoi),
    partConjoint: round2(partConjoint),
    solde: round2(solde),
    aRembourser: {
      ...aRembourser,
      montant: round2(aRembourser.montant),
    },
  };
}

/**
 * Calcule la répartition des dépenses partagées par catégorie.
 * @param {Array} expenses - Liste des dépenses partagées
 * @returns {Array} Données pour graphique donut
 */
export function computePartageByCat(expenses) {
  if (!expenses || expenses.length === 0) return [];

  const groups = {};
  for (const exp of expenses) {
    if (!groups[exp.categorie]) {
      groups[exp.categorie] = 0;
    }
    groups[exp.categorie] += exp.montant;
  }

  return PARTAGE_CATEGORIES
    .filter(cat => groups[cat.id] > 0)
    .map(cat => ({
      name: cat.label,
      value: round2(groups[cat.id]),
      color: cat.color,
      icon: cat.icon,
    }));
}

/**
 * Calcule l'évolution chronologique du solde au fil des dépenses.
 * @param {Array} expenses - Liste des dépenses triées par date
 * @returns {Array} Points de la timeline avec solde cumulé
 */
export function computePartageTimeline(expenses) {
  if (!expenses || expenses.length === 0) return [];

  // Trier par date
  const sorted = [...expenses].sort((a, b) => {
    const [da, ma, ya] = a.date.split('/').map(Number);
    const [db, mb, yb] = b.date.split('/').map(Number);
    const dateA = new Date(ya, ma - 1, da);
    const dateB = new Date(yb, mb - 1, db);
    return dateA - dateB;
  });

  let soldeCumule = 0;
  return sorted.map((exp, idx) => {
    const maPart = exp.montant * exp.ratio;
    if (exp.payePar === 'moi') {
      soldeCumule += (exp.montant - maPart); // conjoint me doit cette part
    } else {
      soldeCumule -= maPart; // je dois ma part au conjoint
    }

    return {
      idx: idx + 1,
      date: exp.date,
      description: exp.description,
      montant: exp.montant,
      solde: round2(soldeCumule),
    };
  });
}

/**
 * Filtre les dépenses par mois.
 * @param {Array} expenses - Toutes les dépenses
 * @param {number} monthIndex - Index du mois (0-11)
 * @returns {Array} Dépenses du mois
 */
export function filterExpensesByMonth(expenses, monthIndex) {
  if (!expenses) return [];
  return expenses.filter(exp => exp.mois === monthIndex);
}

/**
 * Génère un ID unique pour une dépense.
 */
export function generateExpenseId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
