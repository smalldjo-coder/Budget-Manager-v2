export function initializeMonthsData() {
  return Array(12).fill(null).map(() => ({
    revenus: { activite: 0, sociaux: 0, interets: 0, fluxInternes: 0 },
    sorties: {
      besoins: { fixes: 0, variables: 0, necessite: 0 },
      dettes: { creditImmo: 0, creditAuto: 0, autres: 0 },
      epargne: { livret: 0, placement: 0, investPerso: 0 },
      envies: { fourmilles: 0, occasionnel: 0 }
    },
    patrimoine: { lep: 0, livretA: 0, pea: 0 },
    levier: 0.5
  }));
}

export function initializeBudgetPrevu() {
  return {
    revenus: { activite: 0, sociaux: 0, interets: 0 },
    besoins: { fixes: 0, variables: 0 },
    dettes: { total: 0 },
    epargne: { total: 0 },
    envies: { total: 0 }
  };
}
