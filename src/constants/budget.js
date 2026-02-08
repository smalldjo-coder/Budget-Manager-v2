import {
  Sparkles, Smartphone, BarChart3, Keyboard
} from "lucide-react";

export const STORAGE_KEY = "budget-manager-data";
export const AVAILABLE_YEARS = [2024, 2025, 2026, 2027];
export const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
export const MONTHS_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

// Limites et configuration
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const NOTIFICATION_TIMEOUT_MS = 4000;
export const MAX_MONTANT = 1_000_000_000;

// Objectifs personnalisables
export const DEFAULT_OBJECTIFS = {
  lep: 7812,
  livretA: 3000,
  pea: 10000,
  seuilDettes: 10,
  epargneMin: 5,
  epargneMax: 20,
  enviesMin: 10,
  enviesMax: 30,
  alertesActives: true
};

// Onboarding
export const ONBOARDING_STEPS = [
  {
    title: "Bienvenue dans Budget Manager ! 🎉",
    description: "Gérez votre budget avec la méthode des enveloppes. Suivez vos revenus, dépenses et épargne en toute simplicité.",
    icon: Sparkles
  },
  {
    title: "Import facile",
    description: "Importez vos transactions depuis iCompta ou un fichier CSV. Tout est catégorisé automatiquement.",
    icon: Smartphone
  },
  {
    title: "Visualisez vos finances",
    description: "Consultez le Dashboard pour voir vos indicateurs, graphiques et l'évolution de votre budget.",
    icon: BarChart3
  },
  {
    title: "Raccourcis clavier",
    description: "Naviguez rapidement : S (Saisie), D (Dashboard), ← → (mois), ? (aide). Appuyez sur ? à tout moment.",
    icon: Keyboard
  }
];

// Raccourcis clavier
export const KEYBOARD_SHORTCUTS = [
  { key: "s", description: "Aller à Saisie", action: "saisie" },
  { key: "d", description: "Aller au Dashboard", action: "dashboard" },
  { key: "p", description: "Aller au Patrimoine", action: "patrimoine" },
  { key: "ArrowLeft", description: "Mois précédent", action: "prevMonth" },
  { key: "ArrowRight", description: "Mois suivant", action: "nextMonth" },
  { key: "i", description: "Import iCompta", action: "importICompta" },
  { key: "e", description: "Export CSV", action: "export" },
  { key: "t", description: "Changer de thème", action: "theme" },
  { key: "?", description: "Afficher l'aide", action: "help" },
  { key: "Escape", description: "Fermer modal", action: "closeModal" }
];
