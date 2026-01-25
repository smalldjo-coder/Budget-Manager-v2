import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BudgetState,
  Revenus,
  Besoins,
  Dettes,
  Epargne,
  Envies,
  Transaction,
  CalculatedBudget,
  MonthlyData,
  ObjectifsPatrimoine
} from '../types/budget';

const initialRevenus: Revenus = {
  activite: 0,
  sociaux: 0,
  interets: 0,
  fluxInternes: 0,
};

const initialBesoins: Besoins = {
  fixes: 0,
  variables: 0,
};

const initialDettes: Dettes = {
  creditImmo: 0,
  creditAuto: 0,
  autres: 0,
};

const initialEpargne: Epargne = {
  livretLEP: 0,
  placementPEA: 0,
  investPersonnel: 0,
};

const initialEnvies: Envies = {
  fourmilles: 0,
  occasionnel: 0,
};

const initialObjectifs: ObjectifsPatrimoine = {
  lepTarget: 7812,
  lepCurrent: 0,
  peaTarget: 10000,
  peaCurrent: 0,
};

interface BudgetActions {
  setRevenus: (revenus: Partial<Revenus>) => void;
  setBesoins: (besoins: Partial<Besoins>) => void;
  setDettes: (dettes: Partial<Dettes>) => void;
  setEpargne: (epargne: Partial<Epargne>) => void;
  setEnvies: (envies: Partial<Envies>) => void;
  setObjectifs: (objectifs: Partial<ObjectifsPatrimoine>) => void;
  setLeverValue: (value: number) => void;
  addTransaction: (transaction: Transaction) => void;
  addTransactions: (transactions: Transaction[]) => void;
  clearTransactions: () => void;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  calculateBudget: () => CalculatedBudget;
  getMonthlyData: (month: number, year: number) => MonthlyData | null;
  saveCurrentMonth: () => void;
  resetBudget: () => void;
}

export const useBudgetStore = create<BudgetState & BudgetActions>()(
  persist(
    (set, get) => ({
      revenus: initialRevenus,
      besoins: initialBesoins,
      dettes: initialDettes,
      epargne: initialEpargne,
      envies: initialEnvies,
      objectifs: initialObjectifs,
      transactions: [],
      monthlyHistory: [],
      leverValue: 50,
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth(),

      setRevenus: (revenus) =>
        set((state) => ({ revenus: { ...state.revenus, ...revenus } })),

      setBesoins: (besoins) =>
        set((state) => ({ besoins: { ...state.besoins, ...besoins } })),

      setDettes: (dettes) =>
        set((state) => ({ dettes: { ...state.dettes, ...dettes } })),

      setEpargne: (epargne) =>
        set((state) => ({ epargne: { ...state.epargne, ...epargne } })),

      setEnvies: (envies) =>
        set((state) => ({ envies: { ...state.envies, ...envies } })),

      setObjectifs: (objectifs) =>
        set((state) => ({ objectifs: { ...state.objectifs, ...objectifs } })),

      setLeverValue: (value) => set({ leverValue: value }),

      addTransaction: (transaction) =>
        set((state) => ({ transactions: [...state.transactions, transaction] })),

      addTransactions: (transactions) =>
        set((state) => ({ transactions: [...state.transactions, ...transactions] })),

      clearTransactions: () => set({ transactions: [] }),

      setSelectedMonth: (month) => set({ selectedMonth: month }),

      setSelectedYear: (year) => set({ selectedYear: year }),

      calculateBudget: () => {
        const state = get();
        const { revenus, besoins, dettes, epargne, envies } = state;

        // CA = Activité + Sociaux + Intérêts (flux internes exclus)
        const ca = revenus.activite + revenus.sociaux + revenus.interets;
        const totalRevenus = ca + revenus.fluxInternes;

        const totalBesoins = besoins.fixes + besoins.variables;
        const totalDettes = dettes.creditImmo + dettes.creditAuto + dettes.autres;
        const totalEpargne = epargne.livretLEP + epargne.placementPEA + epargne.investPersonnel;
        const totalEnvies = envies.fourmilles + envies.occasionnel;

        // Calcul en cascade
        const soldeApresBesoins = ca - totalBesoins;
        const soldeApresDettes = soldeApresBesoins - totalDettes;
        const soldeApresEpargne = soldeApresDettes - totalEpargne;
        const soldeFinal = soldeApresEpargne - totalEnvies;

        // Alerte si dettes > 10% du revenu activité
        const alerteDettes = revenus.activite > 0 && (totalDettes / revenus.activite) > 0.10;

        // Pourcentages
        const epargnePercentage = ca > 0 ? (totalEpargne / ca) * 100 : 0;
        const enviesPercentage = ca > 0 ? (totalEnvies / ca) * 100 : 0;

        // Disponible pour répartition via le levier
        const disponibleRepartition = Math.max(0, soldeApresDettes);

        return {
          ca,
          totalRevenus,
          totalBesoins,
          totalDettes,
          totalEpargne,
          totalEnvies,
          soldeApresBesoins,
          soldeApresDettes,
          soldeApresEpargne,
          soldeFinal,
          alerteDettes,
          epargnePercentage,
          enviesPercentage,
          disponibleRepartition,
        };
      },

      getMonthlyData: (month, year) => {
        const state = get();
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return state.monthlyHistory.find(
          (m) => m.month === monthNames[month] && m.year === year
        ) || null;
      },

      saveCurrentMonth: () => {
        const state = get();
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const monthData: MonthlyData = {
          month: monthNames[state.selectedMonth],
          year: state.selectedYear,
          revenus: { ...state.revenus },
          besoins: { ...state.besoins },
          dettes: { ...state.dettes },
          epargne: { ...state.epargne },
          envies: { ...state.envies },
        };

        set((prev) => {
          const existingIndex = prev.monthlyHistory.findIndex(
            (m) => m.month === monthData.month && m.year === monthData.year
          );
          if (existingIndex >= 0) {
            const updated = [...prev.monthlyHistory];
            updated[existingIndex] = monthData;
            return { monthlyHistory: updated };
          }
          return { monthlyHistory: [...prev.monthlyHistory, monthData] };
        });
      },

      resetBudget: () =>
        set({
          revenus: initialRevenus,
          besoins: initialBesoins,
          dettes: initialDettes,
          epargne: initialEpargne,
          envies: initialEnvies,
          transactions: [],
          leverValue: 50,
        }),
    }),
    {
      name: 'budget-manager-v2-storage',
    }
  )
);
