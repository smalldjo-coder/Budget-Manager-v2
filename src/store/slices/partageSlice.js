import { loadPartageExpenses, savePartageExpenses, loadSelectedYear } from '../storage';
import { generateExpenseId } from '../../utils/partageCalculations';

export const createPartageSlice = (set, get) => ({
  partageExpenses: loadPartageExpenses(loadSelectedYear()),

  addPartageExpense: (expense) => {
    const { selectedYear, partageExpenses } = get();
    const newExpense = {
      ...expense,
      id: generateExpenseId(),
    };
    const updated = [newExpense, ...partageExpenses];
    set({ partageExpenses: updated });
    savePartageExpenses(updated, selectedYear);
  },

  removePartageExpense: (id) => {
    const { selectedYear, partageExpenses } = get();
    const updated = partageExpenses.filter(e => e.id !== id);
    set({ partageExpenses: updated });
    savePartageExpenses(updated, selectedYear);
  },

  updatePartageExpense: (id, updates) => {
    const { selectedYear, partageExpenses } = get();
    const updated = partageExpenses.map(e =>
      e.id === id ? { ...e, ...updates } : e
    );
    set({ partageExpenses: updated });
    savePartageExpenses(updated, selectedYear);
  },

  clearPartageExpenses: () => {
    const { selectedYear, showNotification } = get();
    if (window.confirm('Réinitialiser toutes les dépenses partagées ?')) {
      set({ partageExpenses: [] });
      savePartageExpenses([], selectedYear);
      showNotification('Dépenses partagées réinitialisées', 'success');
    }
  },

  setPartageExpenses: (expenses) => {
    const { selectedYear } = get();
    set({ partageExpenses: expenses });
    savePartageExpenses(expenses, selectedYear);
  },
});
