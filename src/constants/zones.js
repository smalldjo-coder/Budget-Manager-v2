// Configuration des zones de santé budgétaire (basé sur la méthode des enveloppes)
export const ZONES_CONFIG = {
  besoins: [
    { max: 50, bgColor: "bg-green-500", textColor: "text-green-400", label: "Équilibré", advice: "Permet d'épargner et de profiter" },
    { max: 75, bgColor: "bg-yellow-500", textColor: "text-yellow-400", label: "Raisonnable", advice: "Limite l'épargne possible" },
    { max: 100, bgColor: "bg-red-500", textColor: "text-red-400", label: "Instable", advice: "Risque d'endettement" }
  ],
  dettes: [
    { max: 10, bgColor: "bg-green-500", textColor: "text-green-400", label: "Idéal", advice: "Continuez ainsi !" },
    { max: 20, bgColor: "bg-yellow-500", textColor: "text-yellow-400", label: "Restriction", advice: "Accélérez le remboursement" },
    { max: 100, bgColor: "bg-red-500", textColor: "text-red-400", label: "Stressant", advice: "Priorité au désendettement" }
  ],
  epargne: [
    { max: 5, bgColor: "bg-red-500", textColor: "text-red-400", label: "Insuffisant", advice: "Priorisez le fonds d'urgence" },
    { max: 20, bgColor: "bg-green-500", textColor: "text-green-400", label: "Optimal", advice: "Potentiel maximisé !" },
    { max: 100, bgColor: "bg-orange-500", textColor: "text-orange-400", label: "Attention", advice: "Vérifiez que ce n'est pas au détriment des envies" }
  ],
  envies: [
    { max: 10, bgColor: "bg-red-500", textColor: "text-red-400", label: "Frustration", advice: "Autorisez-vous plus de plaisirs" },
    { max: 30, bgColor: "bg-green-500", textColor: "text-green-400", label: "Équilibré", advice: "Profitez sans culpabiliser !" },
    { max: 100, bgColor: "bg-red-500", textColor: "text-red-400", label: "Surconsommation", advice: "Limite votre épargne" }
  ]
};

// Fonction pour obtenir la zone courante
export function getZone(pct, zones) {
  const pctValue = pct * 100;
  for (const zone of zones) {
    if (pctValue <= zone.max) return zone;
  }
  return zones[zones.length - 1];
}
