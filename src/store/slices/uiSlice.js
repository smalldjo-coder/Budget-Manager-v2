import { NOTIFICATION_TIMEOUT_MS } from '../../constants';
import { loadOnboardingDone } from '../storage';

export const createUiSlice = (set, get) => ({
  view: 'saisie',
  notification: null,
  mobileMenuOpen: false,
  showSettings: false,
  showTransactions: null,
  showCompare: false,
  compareMonths: [0, 1],
  showBudgetPrevu: false,
  showOnboarding: !loadOnboardingDone(),
  showKeyboardHelp: false,
  importStats: null,
  lastSaved: null,
  isImporting: false,

  setView: (view) => set({ view }),

  showNotification: (message, type = 'success', icon = null) => {
    set({ notification: { message, type, icon } });
    setTimeout(() => set({ notification: null }), NOTIFICATION_TIMEOUT_MS);
  },

  clearNotification: () => set({ notification: null }),

  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowTransactions: (config) => set({ showTransactions: config }),
  setShowCompare: (show) => set({ showCompare: show }),
  setCompareMonths: (months) => set({ compareMonths: months }),
  setShowBudgetPrevu: (show) => set({ showBudgetPrevu: show }),
  setShowOnboarding: (show) => set({ showOnboarding: show }),
  setShowKeyboardHelp: (show) => set({ showKeyboardHelp: show }),
  setImportStats: (stats) => set({ importStats: stats }),
  setLastSaved: (date) => set({ lastSaved: date }),
  setIsImporting: (importing) => set({ isImporting: importing }),

  closeAllModals: () => set({
    showKeyboardHelp: false,
    showSettings: false,
    showBudgetPrevu: false,
    showCompare: false,
    showTransactions: null,
    importStats: null,
  }),
});
