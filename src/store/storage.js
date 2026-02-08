import { STORAGE_KEY, AVAILABLE_YEARS, DEFAULT_OBJECTIFS } from '../constants';
import { initializeMonthsData, initializeBudgetPrevu } from '../utils/initializers';

export function loadFromStorage(year) {
  try {
    const key = `${STORAGE_KEY}-${year}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 12) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Erreur chargement localStorage:", e);
  }
  return null;
}

export function saveToStorage(data, year) {
  try {
    const key = `${STORAGE_KEY}-${year}`;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Erreur sauvegarde localStorage:", e);
    return false;
  }
}

export function loadSelectedYear() {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-selected-year`);
    if (saved) {
      const year = parseInt(saved, 10);
      if (AVAILABLE_YEARS.includes(year)) return year;
    }
  } catch (e) {}
  return new Date().getFullYear();
}

export function saveSelectedYear(year) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-selected-year`, year.toString());
  } catch (e) {}
}

export function loadTransactions(year) {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-transactions-${year}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
}

export function saveTransactions(transactions, year) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-transactions-${year}`, JSON.stringify(transactions));
  } catch (e) {}
}

export function loadObjectifs() {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-objectifs`);
    if (saved) return { ...DEFAULT_OBJECTIFS, ...JSON.parse(saved) };
  } catch (e) {}
  return DEFAULT_OBJECTIFS;
}

export function saveObjectifs(objectifs) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-objectifs`, JSON.stringify(objectifs));
  } catch (e) {}
}

export function loadBudgetPrevu(year) {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-prevu-${year}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return initializeBudgetPrevu();
}

export function saveBudgetPrevu(prevu, year) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-prevu-${year}`, JSON.stringify(prevu));
  } catch (e) {}
}

export function loadTheme() {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-theme`);
    if (saved) return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch (e) {}
  return 'dark';
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-theme`, theme);
  } catch (e) {}
}

export function loadSoldesInitiaux(year) {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-soldes-initiaux-${year}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return { lep: 0, livretA: 0, pea: 0 };
}

export function saveSoldesInitiaux(soldes, year) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-soldes-initiaux-${year}`, JSON.stringify(soldes));
  } catch (e) {}
}

export function loadOnboardingDone() {
  try {
    return localStorage.getItem(`${STORAGE_KEY}-onboarding-done`) === "true";
  } catch (e) {}
  return false;
}

export function saveOnboardingDone() {
  try {
    localStorage.setItem(`${STORAGE_KEY}-onboarding-done`, "true");
  } catch (e) {}
}
