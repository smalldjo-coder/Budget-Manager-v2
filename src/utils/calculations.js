import { MONTHS_SHORT } from '../constants';
import { COLORS } from '../constants/colors';

export function computeMonthCalculs(data, objectifs) {
  const r = data.revenus;
  const s = data.sorties;
  const ca = r.activite + r.sociaux + r.interets;
  const totalBesoins = s.besoins.fixes + s.besoins.variables + (s.besoins.necessite || 0);
  const soldeApresBesoins = ca - totalBesoins;
  const totalDettes = s.dettes.creditImmo + s.dettes.creditAuto + s.dettes.autres;
  const pctDettes = r.activite > 0 ? totalDettes / r.activite : 0;
  const soldeApresDettes = soldeApresBesoins - totalDettes;
  const totalEpargne = s.epargne.livret + s.epargne.placement + s.epargne.investPerso;
  const pctEpargne = ca > 0 ? totalEpargne / ca : 0;
  const soldeApresEpargne = soldeApresDettes - totalEpargne;
  const totalEnvies = s.envies.fourmilles + s.envies.occasionnel;
  const pctEnvies = ca > 0 ? totalEnvies / ca : 0;
  const soldeFinal = soldeApresEpargne - totalEnvies;

  const seuilDettes = objectifs.seuilDettes / 100;
  const epargneMin = objectifs.epargneMin / 100;
  const epargneMax = objectifs.epargneMax / 100;
  const enviesMax = objectifs.enviesMax / 100;

  const epargneObjectif = soldeApresDettes > 0 ? soldeApresDettes * data.levier : 0;
  const enviesObjectif = soldeApresDettes > 0 ? soldeApresDettes * (1 - data.levier) : 0;
  const pctEpargneObjectif = ca > 0 ? (epargneObjectif / ca) * 100 : 0;
  const pctEnviesObjectif = ca > 0 ? (enviesObjectif / ca) * 100 : 0;
  const pctBesoins = ca > 0 ? totalBesoins / ca : 0;

  // Score de santé budgétaire (0-100)
  let healthScore = 100;
  if (pctBesoins > 0.75) healthScore -= 30;
  else if (pctBesoins > 0.50) healthScore -= 15;
  if (pctDettes > 0.20) healthScore -= 25;
  else if (pctDettes > 0.10) healthScore -= 10;
  if (pctEpargne < 0.05 && ca > 0) healthScore -= 20;
  else if (pctEpargne > 0.20) healthScore -= 5;
  if (pctEnvies < 0.10 && ca > 0) healthScore -= 15;
  else if (pctEnvies > 0.30) healthScore -= 20;
  healthScore = Math.max(0, healthScore);

  return {
    ca, totalBesoins, soldeApresBesoins,
    pctBesoins,
    totalDettes, seuilMaxDettes: r.activite * seuilDettes, pctDettes, alerteDettes: pctDettes > seuilDettes, soldeApresDettes,
    totalEpargne, pctEpargne, alerteEpargneMin: pctEpargne < epargneMin && pctEpargne > 0, alerteEpargneMax: pctEpargne > epargneMax, soldeApresEpargne,
    epargneObjectif, pctEpargneObjectif,
    totalEnvies, pctEnvies, alerteEnviesMax: pctEnvies > enviesMax,
    enviesObjectif, pctEnviesObjectif,
    soldeFinal,
    healthScore
  };
}

export function computeAllMonthsCalculs(monthsData) {
  return monthsData.map((m, idx) => {
    const ca = m.revenus.activite + m.revenus.sociaux + m.revenus.interets;
    const besoins = m.sorties.besoins.fixes + m.sorties.besoins.variables + (m.sorties.besoins.necessite || 0);
    const dettes = m.sorties.dettes.creditImmo + m.sorties.dettes.creditAuto + m.sorties.dettes.autres;
    const epargne = m.sorties.epargne.livret + m.sorties.epargne.placement + m.sorties.epargne.investPerso;
    const envies = m.sorties.envies.fourmilles + m.sorties.envies.occasionnel;
    return { mois: MONTHS_SHORT[idx], ca, besoins, dettes, epargne, envies, soldeFinal: ca - besoins - dettes - epargne - envies };
  });
}

export function computeAnnualStats(allMonthsCalculs, budgetPrevu) {
  const realise = {
    revenus: allMonthsCalculs.reduce((s, m) => s + m.ca, 0),
    besoins: allMonthsCalculs.reduce((s, m) => s + m.besoins, 0),
    dettes: allMonthsCalculs.reduce((s, m) => s + m.dettes, 0),
    epargne: allMonthsCalculs.reduce((s, m) => s + m.epargne, 0),
    envies: allMonthsCalculs.reduce((s, m) => s + m.envies, 0),
    solde: allMonthsCalculs.reduce((s, m) => s + m.soldeFinal, 0)
  };
  const prevu = {
    revenus: (budgetPrevu.revenus.activite + budgetPrevu.revenus.sociaux + budgetPrevu.revenus.interets) * 12,
    besoins: (budgetPrevu.besoins.fixes + budgetPrevu.besoins.variables) * 12,
    dettes: budgetPrevu.dettes.total * 12,
    epargne: budgetPrevu.epargne.total * 12,
    envies: budgetPrevu.envies.total * 12
  };
  prevu.solde = prevu.revenus - prevu.besoins - prevu.dettes - prevu.epargne - prevu.envies;
  return { realise, prevu };
}

export function computeEpargnesCumulees(allMonthsCalculs) {
  let c = 0;
  return allMonthsCalculs.map(m => { c += m.epargne; return { ...m, epargneCumulee: c }; });
}

export function computePatrimoineObjectifs(monthsData) {
  const monthsWithData = monthsData.filter(m => {
    const ca = m.revenus.activite + m.revenus.sociaux + m.revenus.interets;
    return ca > 0;
  });

  if (monthsWithData.length === 0) {
    return { lep: 7812, livretA: 3000, pea: 10000 };
  }

  const avgBesoins = monthsWithData.reduce((s, m) => {
    return s + m.sorties.besoins.fixes + m.sorties.besoins.variables + (m.sorties.besoins.necessite || 0);
  }, 0) / monthsWithData.length;

  const avgActivite = monthsWithData.reduce((s, m) => s + m.revenus.activite, 0) / monthsWithData.length;

  return {
    lep: Math.round(avgBesoins * 6) || 7812,
    livretA: Math.round(avgBesoins * 3) || 3000,
    pea: Math.round(avgActivite * 12) || 10000,
  };
}

export function computePatrimoineEvolution(monthsData) {
  return monthsData.map((m, idx) => ({
    mois: MONTHS_SHORT[idx],
    lep: m.patrimoine.lep || 0,
    livretA: m.patrimoine.livretA || 0,
    pea: m.patrimoine.pea || 0,
    total: (m.patrimoine.lep || 0) + (m.patrimoine.livretA || 0) + (m.patrimoine.pea || 0),
  }));
}

export function computeDonutData(calculs) {
  if (calculs.ca === 0) return [];
  return [
    { name: "Besoins", value: calculs.totalBesoins, color: COLORS.besoins },
    { name: "Dettes", value: calculs.totalDettes, color: COLORS.dettes },
    { name: "Épargne", value: calculs.totalEpargne, color: COLORS.epargne },
    { name: "Envies", value: calculs.totalEnvies, color: COLORS.envies },
    { name: "Solde", value: Math.max(0, calculs.soldeFinal), color: COLORS.solde },
  ].filter(d => d.value > 0);
}
