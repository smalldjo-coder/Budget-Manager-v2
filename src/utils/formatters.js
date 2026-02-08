// Formatters optimisés (instances globales)
const moneyFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const pctFormatter = new Intl.NumberFormat("fr-FR", { style: "percent", minimumFractionDigits: 1 });

// Fonction d'arrondi à 2 décimales pour éviter les problèmes de précision
export function round2(value) {
  return Math.round(value * 100) / 100;
}

export function formatMoney(v) {
  return moneyFormatter.format(v);
}

export function formatPct(v) {
  return pctFormatter.format(v);
}
