import { DEFAULT_OBJECTIFS } from '../../constants';
import { initializeBudgetPrevu } from '../../utils/initializers';
import {
  loadObjectifs, saveObjectifs,
  loadBudgetPrevu, saveBudgetPrevu,
  loadTheme, saveTheme,
  loadSelectedYear
} from '../storage';

export const createSettingsSlice = (set, get) => ({
  objectifs: loadObjectifs(),
  budgetPrevu: loadBudgetPrevu(loadSelectedYear()),
  theme: loadTheme(),

  setObjectifs: (objectifs) => {
    set({ objectifs });
    saveObjectifs(objectifs);
  },

  updateObjectifs: (partial) => {
    set(state => {
      const updated = { ...state.objectifs, ...partial };
      saveObjectifs(updated);
      return { objectifs: updated };
    });
  },

  resetObjectifs: () => {
    set({ objectifs: DEFAULT_OBJECTIFS });
    saveObjectifs(DEFAULT_OBJECTIFS);
  },

  setBudgetPrevu: (prevu) => {
    set({ budgetPrevu: prevu });
    saveBudgetPrevu(prevu, get().selectedYear);
  },

  updateBudgetPrevu: (updater) => {
    set(state => {
      const updated = typeof updater === 'function' ? updater(state.budgetPrevu) : updater;
      saveBudgetPrevu(updated, state.selectedYear);
      return { budgetPrevu: updated };
    });
  },

  resetBudgetPrevu: () => {
    const prevu = initializeBudgetPrevu();
    set({ budgetPrevu: prevu });
    saveBudgetPrevu(prevu, get().selectedYear);
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: newTheme });
    saveTheme(newTheme);
    document.documentElement.classList.toggle('light-theme', newTheme === 'light');
  },

  setTheme: (theme) => {
    set({ theme });
    saveTheme(theme);
    document.documentElement.classList.toggle('light-theme', theme === 'light');
  },
});
