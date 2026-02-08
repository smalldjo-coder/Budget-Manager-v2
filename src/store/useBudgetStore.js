import { create } from 'zustand';
import { createBudgetDataSlice } from './slices/budgetDataSlice';
import { createUiSlice } from './slices/uiSlice';
import { createSettingsSlice } from './slices/settingsSlice';

export const useBudgetStore = create((...a) => ({
  ...createBudgetDataSlice(...a),
  ...createUiSlice(...a),
  ...createSettingsSlice(...a),
}));
