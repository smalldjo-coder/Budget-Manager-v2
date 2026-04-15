import { create } from 'zustand';
import { createBudgetDataSlice } from './slices/budgetDataSlice';
import { createUiSlice } from './slices/uiSlice';
import { createSettingsSlice } from './slices/settingsSlice';
import { createPartageSlice } from './slices/partageSlice';

export const useBudgetStore = create((...a) => ({
  ...createBudgetDataSlice(...a),
  ...createUiSlice(...a),
  ...createSettingsSlice(...a),
  ...createPartageSlice(...a),
}));
