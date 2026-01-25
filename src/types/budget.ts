export interface Revenus {
  activite: number;
  sociaux: number;
  interets: number;
  fluxInternes: number;
}

export interface Besoins {
  fixes: number;
  variables: number;
}

export interface Dettes {
  creditImmo: number;
  creditAuto: number;
  autres: number;
}

export interface Epargne {
  livretLEP: number;
  placementPEA: number;
  investPersonnel: number;
}

export interface Envies {
  fourmilles: number;
  occasionnel: number;
}

export interface ObjectifsPatrimoine {
  lepTarget: number;
  lepCurrent: number;
  peaTarget: number;
  peaCurrent: number;
}

export interface MonthlyData {
  month: string;
  year: number;
  revenus: Revenus;
  besoins: Besoins;
  dettes: Dettes;
  epargne: Epargne;
  envies: Envies;
}

export interface Transaction {
  id: string;
  compte: string;
  date: Date;
  montant: number;
  categorie: string;
  sousCategorie: string;
}

export interface BudgetState {
  revenus: Revenus;
  besoins: Besoins;
  dettes: Dettes;
  epargne: Epargne;
  envies: Envies;
  objectifs: ObjectifsPatrimoine;
  transactions: Transaction[];
  monthlyHistory: MonthlyData[];
  leverValue: number; // 0-100, pourcentage vers épargne
  selectedYear: number;
  selectedMonth: number;
}

export interface CalculatedBudget {
  ca: number; // Chiffre d'affaires (sans flux internes)
  totalRevenus: number;
  totalBesoins: number;
  totalDettes: number;
  totalEpargne: number;
  totalEnvies: number;
  soldeApresBesoins: number;
  soldeApresDettes: number;
  soldeApresEpargne: number;
  soldeFinal: number;
  alerteDettes: boolean;
  epargnePercentage: number;
  enviesPercentage: number;
  disponibleRepartition: number;
}

export type CategoryType = 'revenus' | 'besoins' | 'dettes' | 'epargne' | 'envies';

export interface CSVRow {
  compte: string;
  dateValeur: string;
  montant: string;
}
