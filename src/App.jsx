import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { parse, isValid } from "date-fns";
import {
  BarChart3, Pencil, TrendingUp, Smartphone, Download, Upload, Trash2,
  Wallet, Home, Car, Gift, PiggyBank, BookOpen, Target, Calendar,
  CreditCard, Briefcase, Users, Coins, ArrowRightLeft, Scale, Check,
  AlertTriangle, X, Save, RotateCcw, HardDrive, ChevronDown, Settings,
  Eye, ArrowLeftRight, Bell, BellOff, Sun, Moon, ClipboardList, Loader2,
  HelpCircle, ChevronRight, Keyboard, Sparkles
} from "lucide-react";

// ============= CONSTANTES =============
const STORAGE_KEY = "budget-manager-data";
const AVAILABLE_YEARS = [2024, 2025, 2026, 2027];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const MONTHS_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

// Limites et configuration
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const NOTIFICATION_TIMEOUT_MS = 4000;
const MAX_MONTANT = 1_000_000_000;

// Couleurs pour les graphiques
const COLORS = {
  besoins: "#6B7280",
  dettes: "#3B82F6",
  epargne: "#F97316",
  envies: "#EF4444",
  solde: "#10B981",
  prevu: "#6366F1",
  realise: "#10B981"
};

// Configuration des zones de santé budgétaire (basé sur la méthode des enveloppes)
const ZONES_CONFIG = {
  besoins: [
    { max: 50, bgColor: "bg-green-500", textColor: "text-green-400", label: "Équilibré", advice: "Permet d'épargner et de profiter" },
    { max: 75, bgColor: "bg-yellow-500", textColor: "text-yellow-400", label: "Raisonnable", advice: "Limite l'épargne possible" },
    { max: 100, bgColor: "bg-red-500", textColor: "text-red-400", label: "Instable", advice: "Risque d'endettement" }
  ],
  dettes: [
    { max: 10, bgColor: "bg-green-500", textColor: "text-green-400", label: "Idéal", advice: "Continuez ainsi !" },
    { max: 20, bgColor: "bg-yellow-500", textColor: "text-yellow-400", label: "Restriction", advice: "Accélérez le remboursement" },
    { max: 100, bgColor: "bg-red-500", textColor: "text-red-400", label: "Stressant", advice: "Priorité au désendettement" }
  ],
  epargne: [
    { max: 5, bgColor: "bg-red-500", textColor: "text-red-400", label: "Insuffisant", advice: "Priorisez le fonds d'urgence" },
    { max: 20, bgColor: "bg-green-500", textColor: "text-green-400", label: "Optimal", advice: "Potentiel maximisé !" },
    { max: 100, bgColor: "bg-orange-500", textColor: "text-orange-400", label: "Attention", advice: "Vérifiez que ce n'est pas au détriment des envies" }
  ],
  envies: [
    { max: 10, bgColor: "bg-red-500", textColor: "text-red-400", label: "Frustration", advice: "Autorisez-vous plus de plaisirs" },
    { max: 30, bgColor: "bg-green-500", textColor: "text-green-400", label: "Équilibré", advice: "Profitez sans culpabiliser !" },
    { max: 100, bgColor: "bg-red-500", textColor: "text-red-400", label: "Surconsommation", advice: "Limite votre épargne" }
  ]
};

// Fonction pour obtenir la zone courante
const getZone = (pct, zones) => {
  const pctValue = pct * 100;
  for (const zone of zones) {
    if (pctValue <= zone.max) return zone;
  }
  return zones[zones.length - 1];
};

// Formatters optimisés (instances globales)
const moneyFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const pctFormatter = new Intl.NumberFormat("fr-FR", { style: "percent", minimumFractionDigits: 1 });

// Fonction d'arrondi à 2 décimales pour éviter les problèmes de précision
function round2(value) {
  return Math.round(value * 100) / 100;
}

function initializeMonthsData() {
  return Array(12).fill(null).map(() => ({
    revenus: { activite: 0, sociaux: 0, interets: 0, fluxInternes: 0 },
    sorties: {
      besoins: { fixes: 0, variables: 0, necessite: 0 },
      dettes: { creditImmo: 0, creditAuto: 0, autres: 0 },
      epargne: { livret: 0, placement: 0, investPerso: 0 },
      envies: { fourmilles: 0, occasionnel: 0 }
    },
    patrimoine: { lep: 0, pea: 0 },
    levier: 0.5
  }));
}

function loadFromStorage(year) {
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

function saveToStorage(data, year) {
  try {
    const key = `${STORAGE_KEY}-${year}`;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Erreur sauvegarde localStorage:", e);
    return false;
  }
}

function loadSelectedYear() {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-selected-year`);
    if (saved) {
      const year = parseInt(saved, 10);
      if (AVAILABLE_YEARS.includes(year)) return year;
    }
  } catch (e) {}
  return new Date().getFullYear();
}

function saveSelectedYear(year) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-selected-year`, year.toString());
  } catch (e) {}
}

// Transactions détaillées
function loadTransactions(year) {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-transactions-${year}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
}

function saveTransactions(transactions, year) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-transactions-${year}`, JSON.stringify(transactions));
  } catch (e) {}
}

// Objectifs personnalisables
const DEFAULT_OBJECTIFS = {
  lep: 7812,
  pea: 10000,
  seuilDettes: 10,
  epargneMin: 5,
  epargneMax: 20,
  enviesMin: 10,
  enviesMax: 30,
  alertesActives: true
};

function loadObjectifs() {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-objectifs`);
    if (saved) return { ...DEFAULT_OBJECTIFS, ...JSON.parse(saved) };
  } catch (e) {}
  return DEFAULT_OBJECTIFS;
}

function saveObjectifs(objectifs) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-objectifs`, JSON.stringify(objectifs));
  } catch (e) {}
}

// Budget prévisionnel
function initializeBudgetPrevu() {
  return {
    revenus: { activite: 0, sociaux: 0, interets: 0 },
    besoins: { fixes: 0, variables: 0 },
    dettes: { total: 0 },
    epargne: { total: 0 },
    envies: { total: 0 }
  };
}

function loadBudgetPrevu(year) {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-prevu-${year}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return initializeBudgetPrevu();
}

function saveBudgetPrevu(prevu, year) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-prevu-${year}`, JSON.stringify(prevu));
  } catch (e) {}
}

// Thème
function loadTheme() {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY}-theme`);
    if (saved) return saved;
    // Respecter les préférences système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch (e) {}
  return 'dark';
}

function saveTheme(theme) {
  try {
    localStorage.setItem(`${STORAGE_KEY}-theme`, theme);
  } catch (e) {}
}

// Onboarding
const ONBOARDING_STEPS = [
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

function loadOnboardingDone() {
  try {
    return localStorage.getItem(`${STORAGE_KEY}-onboarding-done`) === "true";
  } catch (e) {}
  return false;
}

function saveOnboardingDone() {
  try {
    localStorage.setItem(`${STORAGE_KEY}-onboarding-done`, "true");
  } catch (e) {}
}

// Raccourcis clavier
const KEYBOARD_SHORTCUTS = [
  { key: "s", description: "Aller à Saisie", action: "saisie" },
  { key: "d", description: "Aller au Dashboard", action: "dashboard" },
  { key: "ArrowLeft", description: "Mois précédent", action: "prevMonth" },
  { key: "ArrowRight", description: "Mois suivant", action: "nextMonth" },
  { key: "i", description: "Import iCompta", action: "importICompta" },
  { key: "e", description: "Export CSV", action: "export" },
  { key: "t", description: "Changer de thème", action: "theme" },
  { key: "?", description: "Afficher l'aide", action: "help" },
  { key: "Escape", description: "Fermer modal", action: "closeModal" }
];

// Composant Onboarding
const Onboarding = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const currentStep = ONBOARDING_STEPS[step];
  const isLastStep = step === ONBOARDING_STEPS.length - 1;
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (isLastStep) {
      saveOnboardingDone();
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    saveOnboardingDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        {/* Progress */}
        <div className="flex gap-1 p-4 pb-0">
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-blue-500' : 'bg-gray-700'}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-bounce-subtle">
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">{currentStep.title}</h2>
          <p className="text-gray-400 leading-relaxed">{currentStep.description}</p>
        </div>

        {/* Actions */}
        <div className="p-4 pt-0 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 text-gray-400 hover:text-white transition-colors"
          >
            Passer
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 btn-ripple"
          >
            {isLastStep ? "C'est parti !" : "Suivant"}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Aide Raccourcis
const KeyboardHelp = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg w-full max-w-sm animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Raccourcis clavier
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {KEYBOARD_SHORTCUTS.filter(s => s.key !== "Escape").map((shortcut, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-0">
              <span className="text-gray-300 text-sm">{shortcut.description}</span>
              <kbd className="kbd">{shortcut.key === "ArrowLeft" ? "←" : shortcut.key === "ArrowRight" ? "→" : shortcut.key.toUpperCase()}</kbd>
            </div>
          ))}
        </div>
        <div className="p-4 pt-0">
          <p className="text-xs text-gray-500 text-center">Appuyez sur <kbd className="kbd">?</kbd> à tout moment pour afficher cette aide</p>
        </div>
      </div>
    </div>
  );
};

// Composant Modal
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;
  const sizes = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className={`bg-gray-800 rounded-lg w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const InputRow = ({ label, icon: Icon, value, onChange, className = "" }) => (
  <div className={"flex justify-between items-center gap-2 " + className}>
    <label className="text-xs flex items-center gap-1 flex-shrink-0">
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span className="truncate">{label}</span>
    </label>
    <input
      type="number"
      defaultValue={value ? round2(value) : ""}
      onBlur={e => onChange(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
      className="w-24 sm:w-28 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-right text-white text-xs focus:outline-none focus:border-blue-500"
      placeholder="0"
      step="0.01"
    />
  </div>
);

const ResultRow = ({ label, value, pct, alert, alertMessage, target, highlight, formatMoney, formatPct, onClick }) => (
  <div className={"mt-1 pt-1 border-t border-gray-700 " + (highlight ? "bg-gray-700 -mx-3 px-3 py-1" : "") + (onClick ? " cursor-pointer hover:bg-gray-600/50" : "")} onClick={onClick}>
    <div className="flex justify-between items-center text-xs">
      <span className={highlight ? "font-semibold" : ""}>
        {label}
        {onClick && <Eye className="w-3 h-3 inline ml-1 text-gray-500" />}
      </span>
      <div className="text-right">
        <span className={"font-semibold " + (value < 0 ? "text-red-400" : "")}>{formatMoney(value)}</span>
        {pct !== undefined && (
          <span className={"ml-1 " + (alert ? "text-red-400" : "text-gray-400")}>
            ({formatPct(pct)})
            {alert && <span className="ml-1 flex items-center gap-0.5 inline-flex"><AlertTriangle className="w-3 h-3" />{alertMessage}</span>}
            {target && !alert && <span className="ml-1 text-gray-500">cible: {target}</span>}
          </span>
        )}
      </div>
    </div>
  </div>
);

const Gauge = ({ label, value, thresholdLow, thresholdHigh, icon: Icon, color }) => {
  const pct = Math.min(Math.max(value, 0), 100);
  const isOk = (thresholdLow === undefined || value >= thresholdLow) && (thresholdHigh === undefined || value <= thresholdHigh);
  const gaugeColor = isOk ? "#10B981" : "#EF4444";
  const circ = 2 * Math.PI * 36;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle cx="40" cy="40" r="36" stroke="#374151" strokeWidth="6" fill="none" />
          <circle cx="40" cy="40" r="36" stroke={gaugeColor} strokeWidth="6" fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color: gaugeColor }}>{value.toFixed(1)}%</span>
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" style={{ color }} />}
        {label}
      </div>
      <div className="text-xs text-gray-500">
        {thresholdLow !== undefined && thresholdHigh !== undefined ? thresholdLow + "-" + thresholdHigh + "%" : thresholdHigh !== undefined ? "≤" + thresholdHigh + "%" : "≥" + thresholdLow + "%"}
      </div>
      <div className={"text-xs font-semibold flex items-center gap-1 " + (isOk ? "text-green-500" : "text-red-500")}>
        {isOk ? <><Check className="w-3 h-3" /> OK</> : <><AlertTriangle className="w-3 h-3" /> Alerte</>}
      </div>
    </div>
  );
};

const ProgressBar = ({ label, current, target, icon: Icon, formatMoney }) => {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-300 flex items-center gap-1">
          {Icon && <Icon className="w-3 h-3" />}
          {label}
        </span>
        <span className="text-gray-400">{formatMoney(current)} / {formatMoney(target)}</span>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div className={"h-full rounded-full " + (current >= target ? "bg-green-500" : "bg-blue-500")} style={{ width: pct + "%" }} />
      </div>
      <div className="text-right text-xs mt-1">
        <span className={current >= target ? "text-green-400" : "text-blue-400"}>{pct.toFixed(1)}%</span>
      </div>
    </div>
  );
};

// Composant indicateur de santé avec zones colorées
const StatusIndicator = ({ label, pct, zones, compact = false }) => {
  const zone = getZone(pct, zones);
  const pctValue = Math.min(pct * 100, 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className={`font-semibold ${zone.textColor}`}>{zone.label}</span>
        <span className="text-gray-500 italic truncate">{zone.advice}</span>
      </div>
    );
  }

  return (
    <div className="mt-2 p-2 rounded-lg bg-gray-700/50 animate-fadeIn">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={`text-sm font-bold ${zone.textColor}`}>
          {(pct * 100).toFixed(1)}% — {zone.label}
        </span>
      </div>

      {/* Barre de progression avec zones */}
      <div className="relative h-3 bg-gray-600 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          {zones.map((z, i) => {
            const prevMax = zones[i - 1]?.max || 0;
            const width = z.max - prevMax;
            return (
              <div
                key={i}
                className={`h-full ${z.bgColor} opacity-40`}
                style={{ width: `${width}%` }}
              />
            );
          })}
        </div>
        {/* Curseur position actuelle */}
        <div
          className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-300"
          style={{ left: `${Math.min(pctValue, 99)}%` }}
        />
      </div>

      {/* Légende des seuils */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0%</span>
        {zones.slice(0, -1).map((z, i) => (
          <span key={i}>{z.max}%</span>
        ))}
        <span>100%</span>
      </div>

      {/* Message contextuel */}
      <p className="text-xs text-gray-400 mt-1 italic">{zone.advice}</p>
    </div>
  );
};

function parseCSVContent(csvContent) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ';') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField.trim());
        if (currentRow.length > 0 && currentRow.some(f => f !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        if (char === '\r') i++;
      } else if (char !== '\r') {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export default function BudgetApp() {
  const [selectedYear, setSelectedYear] = useState(loadSelectedYear);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [view, setView] = useState("saisie");
  const [monthsData, setMonthsData] = useState(() => loadFromStorage(loadSelectedYear()) || initializeMonthsData());
  const [transactions, setTransactions] = useState(() => loadTransactions(loadSelectedYear()));
  const [notification, setNotification] = useState(null);
  const [importStats, setImportStats] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [objectifs, setObjectifs] = useState(loadObjectifs);
  const [showSettings, setShowSettings] = useState(false);
  const [showTransactions, setShowTransactions] = useState(null); // { month, category, subcategory }
  const [showCompare, setShowCompare] = useState(false);
  const [compareMonths, setCompareMonths] = useState([0, 1]);
  const [budgetPrevu, setBudgetPrevu] = useState(() => loadBudgetPrevu(loadSelectedYear()));
  const [showBudgetPrevu, setShowBudgetPrevu] = useState(false);
  const [theme, setTheme] = useState(loadTheme);
  const [isImporting, setIsImporting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !loadOnboardingDone());
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const fileInputRef = useRef(null);
  const iComptaInputRef = useRef(null);

  // Charger les données quand l'année change
  useEffect(() => {
    const data = loadFromStorage(selectedYear);
    setMonthsData(data || initializeMonthsData());
    setTransactions(loadTransactions(selectedYear));
    setBudgetPrevu(loadBudgetPrevu(selectedYear));
    saveSelectedYear(selectedYear);
  }, [selectedYear]);

  // Sauvegarder objectifs quand ils changent
  useEffect(() => {
    saveObjectifs(objectifs);
  }, [objectifs]);

  // Sauvegarder budget prévisionnel
  useEffect(() => {
    saveBudgetPrevu(budgetPrevu, selectedYear);
  }, [budgetPrevu, selectedYear]);

  // Appliquer le thème
  useEffect(() => {
    saveTheme(theme);
    document.documentElement.classList.toggle('light-theme', theme === 'light');
  }, [theme]);

  // Auto-save to localStorage when data changes
  useEffect(() => {
    const saved = saveToStorage(monthsData, selectedYear);
    if (saved) {
      setLastSaved(new Date());
    } else {
      // Notification d'erreur si la sauvegarde échoue
      setNotification({ message: "Erreur de sauvegarde - Espace disque insuffisant ?", type: "error", icon: AlertTriangle });
      setTimeout(() => setNotification(null), NOTIFICATION_TIMEOUT_MS);
    }
  }, [monthsData, selectedYear]);

  const showNotification = useCallback((message, type = "success", icon = null) => {
    setNotification({ message, type, icon });
    setTimeout(() => setNotification(null), NOTIFICATION_TIMEOUT_MS);
  }, []);

  // Utilisation des formatters globaux optimisés
  const formatMoney = useCallback((v) => moneyFormatter.format(v), []);
  const formatPct = useCallback((v) => pctFormatter.format(v), []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const restoreFromStorage = useCallback(() => {
    const saved = loadFromStorage(selectedYear);
    if (saved) {
      setMonthsData(saved);
      showNotification(`Données ${selectedYear} restaurées`, "success", HardDrive);
    } else {
      showNotification("Aucune sauvegarde trouvée", "error");
    }
  }, [showNotification, selectedYear]);

  const exportToCSV = useCallback(() => {
    const headers = ["Mois", "Revenus_Activite", "Revenus_Sociaux", "Revenus_Interets", "Flux_Internes", "Besoins_Fixes", "Besoins_Variables", "Besoins_Necessite", "Dettes_CreditImmo", "Dettes_CreditAuto", "Dettes_Autres", "Epargne_Livret", "Epargne_Placement", "Epargne_InvestPerso", "Envies_Fourmilles", "Envies_Occasionnel", "Patrimoine_LEP", "Patrimoine_PEA", "Levier"];
    const rows = monthsData.map((d, idx) => [
      MONTHS[idx],
      round2(d.revenus.activite),
      round2(d.revenus.sociaux),
      round2(d.revenus.interets),
      round2(d.revenus.fluxInternes),
      round2(d.sorties.besoins.fixes),
      round2(d.sorties.besoins.variables),
      round2(d.sorties.besoins.necessite || 0),
      round2(d.sorties.dettes.creditImmo),
      round2(d.sorties.dettes.creditAuto),
      round2(d.sorties.dettes.autres),
      round2(d.sorties.epargne.livret),
      round2(d.sorties.epargne.placement),
      round2(d.sorties.epargne.investPerso),
      round2(d.sorties.envies.fourmilles),
      round2(d.sorties.envies.occasionnel),
      round2(d.patrimoine.lep),
      round2(d.patrimoine.pea),
      d.levier
    ]);
    const csvContent = [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `budget_${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Export ${selectedYear} réussi !`, "success", Download);
  }, [monthsData, showNotification, selectedYear]);

  // Raccourcis clavier (placé après les callbacks qu'il utilise)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ne pas intercepter si focus dans un input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();

      switch (key) {
        case 's':
          e.preventDefault();
          setView('saisie');
          break;
        case 'd':
          e.preventDefault();
          setView('dashboard');
          break;
        case 'arrowleft':
          e.preventDefault();
          setCurrentMonth(m => m > 0 ? m - 1 : 11);
          break;
        case 'arrowright':
          e.preventDefault();
          setCurrentMonth(m => m < 11 ? m + 1 : 0);
          break;
        case 'i':
          e.preventDefault();
          iComptaInputRef.current?.click();
          break;
        case 'e':
          e.preventDefault();
          exportToCSV();
          break;
        case 't':
          e.preventDefault();
          toggleTheme();
          break;
        case '?':
          e.preventDefault();
          setShowKeyboardHelp(true);
          break;
        case 'escape':
          setShowKeyboardHelp(false);
          setShowSettings(false);
          setShowBudgetPrevu(false);
          setShowCompare(false);
          setShowTransactions(null);
          setImportStats(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exportToCSV, toggleTheme]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validation taille fichier
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showNotification(`Fichier trop volumineux (max ${MAX_FILE_SIZE_MB}MB)`, "error");
      event.target.value = "";
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const lines = e.target.result.split("\n").filter(line => line.trim());
        if (lines.length < 2) {
          showNotification("Fichier CSV vide", "error");
          setIsImporting(false);
          return;
        }

        const headers = lines[0].split(";").map(h => h.trim());
        if (!headers.includes("Mois") || !headers.includes("Revenus_Activite")) {
          showNotification("Format CSV invalide. Utilisez le format d'export de l'app ou iCompta.", "error");
          setIsImporting(false);
          return;
        }

        const newMonthsData = initializeMonthsData();
        let importedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(";").map(v => v.trim());
          const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === values[0].toLowerCase());
          if (monthIndex === -1) continue;

          const getValue = (h) => {
            const idx = headers.indexOf(h);
            if (idx === -1 || idx >= values.length) return 0;
            // Gérer les virgules décimales françaises
            const val = values[idx].replace(",", ".");
            return parseFloat(val) || 0;
          };

          newMonthsData[monthIndex] = {
            revenus: {
              activite: getValue("Revenus_Activite"),
              sociaux: getValue("Revenus_Sociaux"),
              interets: getValue("Revenus_Interets"),
              fluxInternes: getValue("Flux_Internes")
            },
            sorties: {
              besoins: { fixes: getValue("Besoins_Fixes"), variables: getValue("Besoins_Variables"), necessite: getValue("Besoins_Necessite") },
              dettes: { creditImmo: getValue("Dettes_CreditImmo"), creditAuto: getValue("Dettes_CreditAuto"), autres: getValue("Dettes_Autres") },
              epargne: { livret: getValue("Epargne_Livret"), placement: getValue("Epargne_Placement"), investPerso: getValue("Epargne_InvestPerso") },
              envies: { fourmilles: getValue("Envies_Fourmilles"), occasionnel: getValue("Envies_Occasionnel") }
            },
            patrimoine: { lep: getValue("Patrimoine_LEP"), pea: getValue("Patrimoine_PEA") },
            levier: getValue("Levier") || 0.5
          };
          importedCount++;
        }

        setMonthsData(newMonthsData);
        showNotification(`Import réussi : ${importedCount} mois chargés`, "success", Upload);
      } catch (error) {
        showNotification("Erreur: " + error.message, "error");
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      showNotification("Erreur lecture du fichier", "error");
      setIsImporting(false);
    };

    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  }, [showNotification]);

  const mapIComptaCategory = useCallback((compte) => {
    if (!compte) return null;
    const c = compte.toUpperCase();

    // ===== LIVRETS (LEP, Livret A, LDDS) =====
    // Détection des comptes Livrets pour traitement spécial
    if (c.includes("LIVRET") || (c.includes("🟢") || c.includes("LEP") || c.includes("LDDS"))) {
      // Intérêts perçus sur livrets → revenus passifs
      if (c.includes("INTÉRÊT") || c.includes("INTERET") || c.includes("INTERETS")) {
        return { section: "revenus", category: "interets", source: "livret" };
      }
      // Versements/Virements vers livrets → flux interne (épargne déjà comptée côté compte courant)
      if (c.includes("VERSEMENT") || c.includes("VIREMENT") || c.includes("TRANSFERT") || c.includes("DEPOT") || c.includes("DÉPÔT")) {
        return { section: "revenus", category: "fluxInternes", type: "versement_livret" };
      }
      // Retraits depuis livrets → flux interne (pas une vraie entrée d'argent)
      if (c.includes("RETRAIT") || c.includes("PRÉLÈVEMENT") || c.includes("PRELEVEMENT")) {
        return { section: "revenus", category: "fluxInternes", type: "retrait_livret" };
      }
      // Autres opérations livret ignorées
      return null;
    }

    // ===== ENTRÉES (revenus) =====
    if (c.includes("ENTRÉES") || c.includes("ENTREES") || c.includes("ENTRÉE") || c.includes("ENTREE")) {
      if (c.includes("ACTIVITÉ") || c.includes("ACTIVITE")) return { section: "revenus", category: "activite" };
      if (c.includes("SOCIALES") || c.includes("SOCIAL")) return { section: "revenus", category: "sociaux" };
      if (c.includes("INTÉRÊT") || c.includes("INTERET") || c.includes("REMBOURSEMENT") || c.includes("PRIMES")) return { section: "revenus", category: "interets" };
      return { section: "revenus", category: "activite" };
    }

    // Flux internes entre comptes courants → ignorer (double comptage)
    if (c.includes("FLUX") && c.includes("INTERNE")) return { section: "revenus", category: "fluxInternes" };

    // SORTIES
    if (c.includes("SORTIES") || c.includes("SORTIE")) {
      // BESOINS
      if (c.includes("BESOIN")) {
        if (c.includes("FIXES") || c.includes("FIXE")) return { section: "sorties", category: "besoins", subcategory: "fixes" };
        if (c.includes("VARIABLES") || c.includes("VARIABLE")) return { section: "sorties", category: "besoins", subcategory: "variables" };
        if (c.includes("NECESSITE") || c.includes("NÉCESSITÉ") || c.includes("NECESSITÉ") || c.includes("NÉCÉSSITÉ") || c.includes("NECES")) return { section: "sorties", category: "besoins", subcategory: "necessite" };
        return { section: "sorties", category: "besoins", subcategory: "variables" };
      }

      // DETTES
      if (c.includes("DETTE")) {
        if (c.includes("IMMO") || c.includes("HYPOTHE") || c.includes("LOGEMENT")) return { section: "sorties", category: "dettes", subcategory: "creditImmo" };
        if (c.includes("AUTO") || c.includes("VOITURE") || c.includes("VEHICULE")) return { section: "sorties", category: "dettes", subcategory: "creditAuto" };
        return { section: "sorties", category: "dettes", subcategory: "autres" };
      }

      // ÉPARGNE - Mapping amélioré
      if (c.includes("EPARGNE") || c.includes("ÉPARGNE")) {
        // Livrets
        if (c.includes("LIVRET") || c.includes("LEP") || c.includes("LDD") || c.includes("LDDS") || c.includes("LIVRET A")) {
          return { section: "sorties", category: "epargne", subcategory: "livret" };
        }
        // Placements
        if (c.includes("PLACEMENT") || c.includes("PEA") || c.includes("ASSURANCE VIE") || c.includes("BOURSE") || c.includes("ACTION") || c.includes("INVEST")) {
          return { section: "sorties", category: "epargne", subcategory: "placement" };
        }
        // Investissement personnel
        if (c.includes("PERSONNEL") || c.includes("FORMATION") || c.includes("EDUCATION") || c.includes("COURS") || c.includes("LIVRE")) {
          return { section: "sorties", category: "epargne", subcategory: "investPerso" };
        }
        // Par défaut -> livret
        return { section: "sorties", category: "epargne", subcategory: "livret" };
      }

      // ENVIES
      if (c.includes("ENVIE")) {
        // Fourmilles - petites dépenses récurrentes (café, snacks...)
        if (c.includes("FOURMILLES") || c.includes("FOURMILLE")) {
          return { section: "sorties", category: "envies", subcategory: "fourmilles" };
        }
        // Si on arrive ici, ce n'est PAS Fourmilles → Occasionnel
        return { section: "sorties", category: "envies", subcategory: "occasionnel" };
      }
    }

    return null;
  }, []);

  const handleiComptaImport = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validation taille fichier
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showNotification(`Fichier trop volumineux (max ${MAX_FILE_SIZE_MB}MB)`, "error");
      event.target.value = "";
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSVContent(text);

        if (rows.length < 2) {
          showNotification("Fichier iCompta vide", "error");
          setIsImporting(false);
          return;
        }

        const headers = rows[0];
        const findIndex = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

        const compteIdx = findIndex("compte");
        const dateValeurIdx = findIndex("date de valeur");
        const montantIdx = findIndex("montant");
        const nomIdx = findIndex("nom");

        const COMPTE_IDX = compteIdx !== -1 ? compteIdx : 0;
        const DATE_VALEUR_IDX = dateValeurIdx !== -1 ? dateValeurIdx : 4;
        const MONTANT_IDX = montantIdx !== -1 ? montantIdx : 7;
        const NOM_IDX = nomIdx !== -1 ? nomIdx : 5;

        const newMonthsData = initializeMonthsData();
        const newTransactions = [];
        let stats = { total: 0, mapped: 0, unmapped: 0, skippedYear: 0, unmappedCategories: [] };

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i];
          if (values.length < 8) continue;

          const compte = values[COMPTE_IDX] || "";
          const dateValeur = values[DATE_VALEUR_IDX] || "";
          const nom = values[NOM_IDX] || "";

          // Nettoyer le montant : supprimer espaces, remplacer virgule par point
          let montantStr = (values[MONTANT_IDX] || "").trim();
          montantStr = montantStr.replace(/\s/g, "").replace(",", ".");

          if (!montantStr || montantStr === "") continue;

          // Parser et arrondir à 2 décimales
          const montant = round2(parseFloat(montantStr) || 0);
          if (montant === 0 || Math.abs(montant) > MAX_MONTANT) continue;

          // Parse date using date-fns
          let monthIndex = -1;
          const parsedDate = parse(dateValeur, "dd/MM/yyyy", new Date());

          if (isValid(parsedDate)) {
            const year = parsedDate.getFullYear();
            const month = parsedDate.getMonth();
            // Filtrer selon l'année sélectionnée
            if (year === selectedYear && month >= 0 && month <= 11) {
              monthIndex = month;
            } else {
              stats.skippedYear++;
              continue;
            }
          } else {
            continue;
          }

          stats.total++;
          const mapping = mapIComptaCategory(compte);

          if (mapping) {
            stats.mapped++;
            const { section, category, subcategory } = mapping;
            const absAmount = round2(Math.abs(montant));

            // Stocker la transaction détaillée
            newTransactions.push({
              id: i,
              date: dateValeur,
              nom,
              compte,
              montant: absAmount,
              month: monthIndex,
              section,
              category,
              subcategory: subcategory || null
            });

            if (section === "revenus") {
              newMonthsData[monthIndex].revenus[category] = round2(newMonthsData[monthIndex].revenus[category] + (montant > 0 ? montant : absAmount));
            } else if (section === "sorties" && subcategory) {
              newMonthsData[monthIndex].sorties[category][subcategory] = round2(newMonthsData[monthIndex].sorties[category][subcategory] + absAmount);
            }
          } else {
            stats.unmapped++;
            if (compte && !stats.unmappedCategories.includes(compte)) {
              stats.unmappedCategories.push(compte);
            }
          }
        }

        setMonthsData(newMonthsData);
        setTransactions(newTransactions);
        saveTransactions(newTransactions, selectedYear);
        setImportStats(stats);
        const yearInfo = stats.skippedYear > 0 ? ` (${stats.skippedYear} hors ${selectedYear})` : "";
        showNotification(`Import ${selectedYear}: ${stats.mapped}/${stats.total} transactions${yearInfo}`, "success", Smartphone);

      } catch (error) {
        showNotification("Erreur import: " + error.message, "error");
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      showNotification("Erreur lecture du fichier", "error");
      setIsImporting(false);
    };

    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  }, [mapIComptaCategory, showNotification, selectedYear]);

  const resetAllData = useCallback(() => {
    if (window.confirm(`Réinitialiser toutes les données ${selectedYear} (budget + transactions) ?`)) {
      setMonthsData(initializeMonthsData());
      setTransactions([]);
      setImportStats(null);
      localStorage.removeItem(`${STORAGE_KEY}-${selectedYear}`);
      localStorage.removeItem(`${STORAGE_KEY}-transactions-${selectedYear}`);
      showNotification(`Données ${selectedYear} réinitialisées`, "success", Trash2);
    }
  }, [showNotification, selectedYear]);

  const data = monthsData[currentMonth];

  const updateRevenus = useCallback((cat, val) => {
    setMonthsData(prev => {
      const n = [...prev];
      n[currentMonth] = { ...n[currentMonth], revenus: { ...n[currentMonth].revenus, [cat]: parseFloat(val) || 0 } };
      return n;
    });
  }, [currentMonth]);

  const updateSorties = useCallback((cat, sub, val) => {
    setMonthsData(prev => {
      const n = [...prev];
      n[currentMonth] = { ...n[currentMonth], sorties: { ...n[currentMonth].sorties, [cat]: { ...n[currentMonth].sorties[cat], [sub]: parseFloat(val) || 0 } } };
      return n;
    });
  }, [currentMonth]);

  const updatePatrimoine = useCallback((cat, val) => {
    setMonthsData(prev => {
      const n = [...prev];
      n[currentMonth] = { ...n[currentMonth], patrimoine: { ...n[currentMonth].patrimoine, [cat]: parseFloat(val) || 0 } };
      return n;
    });
  }, [currentMonth]);

  const updateLevier = useCallback((val) => {
    setMonthsData(prev => {
      const n = [...prev];
      n[currentMonth] = { ...n[currentMonth], levier: parseFloat(val) };
      return n;
    });
  }, [currentMonth]);

  const calculs = useMemo(() => {
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

    // Utiliser les objectifs personnalisables
    const seuilDettes = objectifs.seuilDettes / 100;
    const epargneMin = objectifs.epargneMin / 100;
    const epargneMax = objectifs.epargneMax / 100;
    const enviesMax = objectifs.enviesMax / 100;

    const epargneObjectif = soldeApresDettes > 0 ? soldeApresDettes * data.levier : 0;
    const enviesObjectif = soldeApresDettes > 0 ? soldeApresDettes * (1 - data.levier) : 0;
    // Pourcentages objectifs (division sécurisée)
    const pctEpargneObjectif = ca > 0 ? (epargneObjectif / ca) * 100 : 0;
    const pctEnviesObjectif = ca > 0 ? (enviesObjectif / ca) * 100 : 0;
    const pctBesoins = ca > 0 ? totalBesoins / ca : 0;

    // Score de santé budgétaire (0-100)
    let healthScore = 100;
    // Besoins: -points si > 50%
    if (pctBesoins > 0.75) healthScore -= 30;
    else if (pctBesoins > 0.50) healthScore -= 15;
    // Dettes: -points si > 10%
    if (pctDettes > 0.20) healthScore -= 25;
    else if (pctDettes > 0.10) healthScore -= 10;
    // Épargne: -points si < 5% ou > 20%
    if (pctEpargne < 0.05 && ca > 0) healthScore -= 20;
    else if (pctEpargne > 0.20) healthScore -= 5;
    // Envies: -points si < 10% ou > 30%
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
  }, [data, objectifs]);

  const allMonthsCalculs = useMemo(() => monthsData.map((m, idx) => {
    const ca = m.revenus.activite + m.revenus.sociaux + m.revenus.interets;
    const besoins = m.sorties.besoins.fixes + m.sorties.besoins.variables + (m.sorties.besoins.necessite || 0);
    const dettes = m.sorties.dettes.creditImmo + m.sorties.dettes.creditAuto + m.sorties.dettes.autres;
    const epargne = m.sorties.epargne.livret + m.sorties.epargne.placement + m.sorties.epargne.investPerso;
    const envies = m.sorties.envies.fourmilles + m.sorties.envies.occasionnel;
    return { mois: MONTHS_SHORT[idx], ca, besoins, dettes, epargne, envies, soldeFinal: ca - besoins - dettes - epargne - envies };
  }), [monthsData]);

  // Calculs annuels vs prévisionnel
  const annualStats = useMemo(() => {
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
  }, [allMonthsCalculs, budgetPrevu]);

  const epargnesCumulees = useMemo(() => {
    let c = 0;
    return allMonthsCalculs.map(m => { c += m.epargne; return { ...m, epargneCumulee: c }; });
  }, [allMonthsCalculs]);

  const donutData = useMemo(() => {
    if (calculs.ca === 0) return [];
    return [
      { name: "Besoins", value: calculs.totalBesoins, color: COLORS.besoins },
      { name: "Dettes", value: calculs.totalDettes, color: COLORS.dettes },
      { name: "Épargne", value: calculs.totalEpargne, color: COLORS.epargne },
      { name: "Envies", value: calculs.totalEnvies, color: COLORS.envies },
      { name: "Solde", value: Math.max(0, calculs.soldeFinal), color: COLORS.solde },
    ].filter(d => d.value > 0);
  }, [calculs]);

  const HealthCalendar = useCallback(() => (
    <div className="grid grid-cols-6 gap-1">
      {allMonthsCalculs.map((m, idx) => {
        const health = m.ca === 0 ? "empty" : m.soldeFinal >= 0 ? (m.soldeFinal > m.ca * 0.1 ? "good" : "ok") : "bad";
        const colors = { empty: "bg-gray-700", good: "bg-green-600", ok: "bg-yellow-600", bad: "bg-red-600" };
        return (
          <button key={idx} onClick={() => setCurrentMonth(idx)}
            className={colors[health] + " rounded p-1 text-xs hover:opacity-80 " + (currentMonth === idx ? "ring-2 ring-white" : "")}>
            {m.mois}
          </button>
        );
      })}
    </div>
  ), [allMonthsCalculs, currentMonth]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 sm:p-4">
      {notification && (
        <div className={"fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slideDown " + (notification.type === "error" ? "bg-red-600" : "bg-green-600")}>
          {notification.icon && <notification.icon className="w-4 h-4 flex-shrink-0" />}
          <span className="text-sm">{notification.message}</span>
        </div>
      )}

      {/* Loading overlay pendant import */}
      {isImporting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="text-white text-sm">Import en cours...</span>
          </div>
        </div>
      )}

      {/* Onboarding pour nouveaux utilisateurs */}
      <Onboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => setShowOnboarding(false)}
      />

      {/* Aide raccourcis clavier */}
      <KeyboardHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
      <input type="file" ref={iComptaInputRef} onChange={handleiComptaImport} accept=".csv" className="hidden" />

      <div className="max-w-6xl mx-auto">
        {/* Header - Desktop */}
        <div className="hidden sm:flex justify-between items-center mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Budget Manager
              </h1>
              <p className="text-gray-400 text-xs">Répartition intelligente par enveloppes</p>
            </div>
            {/* Sélecteur d'année */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="appearance-none bg-blue-600 text-white px-3 py-1.5 pr-8 rounded text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {AVAILABLE_YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {lastSaved && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Save className="w-3 h-3" />
                Sauvegardé {lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button onClick={() => setView("saisie")} className={"px-3 py-1 rounded text-sm flex items-center gap-1 " + (view === "saisie" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600")}>
              <Pencil className="w-3 h-3" /> Saisie
            </button>
            <button onClick={() => setView("dashboard")} className={"px-3 py-1 rounded text-sm flex items-center gap-1 " + (view === "dashboard" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600")}>
              <TrendingUp className="w-3 h-3" /> Dashboard
            </button>
            <div className="w-px bg-gray-600 mx-1 h-6" />
            <button onClick={() => iComptaInputRef.current?.click()} className="px-3 py-1 rounded text-sm bg-purple-700 hover:bg-purple-600 flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> iCompta
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600 flex items-center gap-1">
              <Download className="w-3 h-3" /> CSV
            </button>
            <button onClick={exportToCSV} className="px-3 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600 flex items-center gap-1">
              <Upload className="w-3 h-3" /> Export
            </button>
            <button onClick={restoreFromStorage} className="px-3 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600 flex items-center gap-1" title="Restaurer depuis la sauvegarde">
              <RotateCcw className="w-3 h-3" />
            </button>
            <button onClick={resetAllData} className="px-3 py-1 rounded text-sm bg-gray-700 hover:bg-red-600 flex items-center gap-1">
              <Trash2 className="w-3 h-3" />
            </button>
            <button onClick={() => setShowSettings(true)} className="px-3 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600 flex items-center gap-1" title="Paramètres">
              <Settings className="w-3 h-3" />
            </button>
            <button onClick={toggleTheme} className="px-3 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600 flex items-center gap-1" title="Changer de thème">
              {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            </button>
            <button onClick={() => setShowKeyboardHelp(true)} className="px-3 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600 flex items-center gap-1" title="Raccourcis clavier (?)">
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Header - Mobile */}
        <div className="sm:hidden mb-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-blue-400">Budget</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-blue-600 text-white px-2 py-0.5 rounded text-sm font-semibold"
              >
                {AVAILABLE_YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-gray-700 rounded"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation tabs mobile */}
          <div className="flex gap-1 mb-2">
            <button onClick={() => setView("saisie")} className={"flex-1 py-2 rounded text-sm font-medium " + (view === "saisie" ? "bg-blue-600" : "bg-gray-700")}>
              <Pencil className="w-4 h-4 mx-auto mb-0.5" />
              Saisie
            </button>
            <button onClick={() => setView("dashboard")} className={"flex-1 py-2 rounded text-sm font-medium " + (view === "dashboard" ? "bg-blue-600" : "bg-gray-700")}>
              <TrendingUp className="w-4 h-4 mx-auto mb-0.5" />
              Dashboard
            </button>
          </div>

          {/* Menu mobile déroulant */}
          {mobileMenuOpen && (
            <div className="bg-gray-800 rounded-lg p-3 mb-2 grid grid-cols-3 gap-2">
              <button onClick={() => { iComptaInputRef.current?.click(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 bg-purple-700 rounded text-xs">
                <Smartphone className="w-4 h-4" />
                iCompta
              </button>
              <button onClick={() => { fileInputRef.current?.click(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 bg-gray-700 rounded text-xs">
                <Download className="w-4 h-4" />
                Import
              </button>
              <button onClick={() => { exportToCSV(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 bg-gray-700 rounded text-xs">
                <Upload className="w-4 h-4" />
                Export
              </button>
              <button onClick={() => { restoreFromStorage(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 bg-gray-700 rounded text-xs">
                <RotateCcw className="w-4 h-4" />
                Restaurer
              </button>
              <button onClick={() => { resetAllData(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 bg-gray-700 hover:bg-red-600 rounded text-xs">
                <Trash2 className="w-4 h-4" />
                Reset
              </button>
              <button onClick={() => { setShowSettings(true); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 bg-gray-700 rounded text-xs">
                <Settings className="w-4 h-4" />
                Config
              </button>
              <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 bg-gray-700 rounded text-xs">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                Thème
              </button>
              <button onClick={() => { setShowKeyboardHelp(true); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2 bg-gray-700 rounded text-xs">
                <HelpCircle className="w-4 h-4" />
                Aide
              </button>
              {lastSaved && (
                <div className="flex flex-col items-center gap-1 p-2 text-gray-500 text-xs">
                  <Save className="w-4 h-4" />
                  {lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </div>
          )}
        </div>

        {importStats && (
          <div className="bg-purple-900 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-300" />
                <span className="text-purple-300 text-sm font-semibold">Dernier import iCompta</span>
                <span className="text-gray-400 text-xs ml-2">{importStats.mapped}/{importStats.total} transactions • {importStats.unmapped} non mappées</span>
              </div>
              <button onClick={() => setImportStats(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Sélecteur de mois - Desktop */}
        <div className="hidden sm:flex justify-center gap-1 mb-3 flex-wrap">
          {MONTHS.map((m, idx) => {
            const hasData = allMonthsCalculs[idx].ca > 0 || allMonthsCalculs[idx].besoins > 0;
            return (
              <button key={m} onClick={() => setCurrentMonth(idx)}
                className={"px-2 py-1 rounded text-xs " + (currentMonth === idx ? "bg-blue-600" : hasData ? "bg-gray-600" : "bg-gray-700") + " hover:bg-gray-500"}>
                {m.substring(0, 3)}
                {hasData && <span className="ml-1 text-green-400">•</span>}
              </button>
            );
          })}
        </div>

        {/* Sélecteur de mois - Mobile (grille 4x3) */}
        <div className="sm:hidden grid grid-cols-4 gap-1 mb-3">
          {MONTHS.map((m, idx) => {
            const hasData = allMonthsCalculs[idx].ca > 0 || allMonthsCalculs[idx].besoins > 0;
            return (
              <button key={m} onClick={() => setCurrentMonth(idx)}
                className={"py-2 rounded text-xs font-medium " + (currentMonth === idx ? "bg-blue-600" : hasData ? "bg-gray-600" : "bg-gray-700")}>
                {m.substring(0, 3)}
                {hasData && <span className="ml-0.5 text-green-400">•</span>}
              </button>
            );
          })}
        </div>

        {view === "dashboard" ? (
          <div className="space-y-3">
            {/* Boutons Dashboard */}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowBudgetPrevu(true)} className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Budget Prévu
              </button>
              <button onClick={() => setShowCompare(true)} className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 rounded text-sm flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4" />
                Comparer
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 card-hover">
              <h2 className="text-sm font-semibold mb-3 text-center text-gray-300 flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Indicateurs — {MONTHS[currentMonth]}
              </h2>

              {/* Score de santé budgétaire */}
              {calculs.ca > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Score de santé budgétaire</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${
                        calculs.healthScore >= 80 ? "text-green-400" :
                        calculs.healthScore >= 60 ? "text-yellow-400" :
                        calculs.healthScore >= 40 ? "text-orange-400" : "text-red-400"
                      }`}>
                        {calculs.healthScore}
                      </span>
                      <span className="text-xs text-gray-500">/100</span>
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        calculs.healthScore >= 80 ? "bg-green-500" :
                        calculs.healthScore >= 60 ? "bg-yellow-500" :
                        calculs.healthScore >= 40 ? "bg-orange-500" : "bg-red-500"
                      }`}
                      style={{ width: `${calculs.healthScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {calculs.healthScore >= 80 ? "🎉 Excellent ! Votre budget est équilibré" :
                     calculs.healthScore >= 60 ? "👍 Bon équilibre, quelques ajustements possibles" :
                     calculs.healthScore >= 40 ? "⚠️ À améliorer, revoyez vos priorités" :
                     "🚨 Critique, action urgente nécessaire"}
                  </p>
                </div>
              )}

              <div className="flex justify-around flex-wrap gap-4">
                <Gauge label="Dettes" value={calculs.pctDettes * 100} thresholdHigh={objectifs.seuilDettes} icon={CreditCard} color="#3B82F6" />
                <Gauge label="Épargne" value={calculs.pctEpargne * 100} thresholdLow={objectifs.epargneMin} thresholdHigh={objectifs.epargneMax} icon={PiggyBank} color="#F97316" />
                <Gauge label="Envies" value={calculs.pctEnvies * 100} thresholdLow={objectifs.enviesMin} thresholdHigh={objectifs.enviesMax} icon={Gift} color="#EF4444" />
              </div>

              {/* Conseils contextuels sous les gauges */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <StatusIndicator pct={calculs.pctDettes} zones={ZONES_CONFIG.dettes} compact />
                <StatusIndicator pct={calculs.pctEpargne} zones={ZONES_CONFIG.epargne} compact />
                <StatusIndicator pct={calculs.pctEnvies} zones={ZONES_CONFIG.envies} compact />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-4 card-hover animate-slideUp stagger-1">
                <h2 className="text-sm font-semibold mb-2 text-center text-gray-300 flex items-center justify-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Répartition — {MONTHS[currentMonth]}
                </h2>
                {donutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {donutData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={v => formatMoney(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-gray-500 animate-fadeIn">
                    <BarChart3 className="w-12 h-12 mb-2 opacity-30" />
                    <span className="text-sm">Aucune donnée ce mois</span>
                    <span className="text-xs text-gray-600">Importez des transactions ou saisissez manuellement</span>
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {donutData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: d.color }} />
                      <span>{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 card-hover animate-slideUp stagger-2">
                <h2 className="text-sm font-semibold mb-2 text-center text-gray-300 flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Évolution annuelle
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={epargnesCumulees}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="mois" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} formatter={v => formatMoney(v)} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Line type="monotone" dataKey="ca" name="Revenus" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="soldeFinal" name="Solde" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="epargneCumulee" name="Épargne cumulée" stroke="#F97316" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-2 text-center text-gray-300 flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Répartition mensuelle
              </h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={allMonthsCalculs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="mois" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} formatter={v => formatMoney(v)} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="besoins" name="Besoins" fill="#6B7280" stackId="a" />
                  <Bar dataKey="dettes" name="Dettes" fill="#3B82F6" stackId="a" />
                  <Bar dataKey="epargne" name="Épargne" fill="#F97316" stackId="a" />
                  <Bar dataKey="envies" name="Envies" fill="#EF4444" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-sm font-semibold mb-3 text-gray-300 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Objectifs Patrimoine
                </h2>
                <ProgressBar label="LEP (Fond urgence)" current={data.patrimoine.lep} target={objectifs.lep} icon={Wallet} formatMoney={formatMoney} />
                <ProgressBar label="PEA (Long terme)" current={data.patrimoine.pea} target={objectifs.pea} icon={TrendingUp} formatMoney={formatMoney} />
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-400 mb-2">Saisie — {MONTHS[currentMonth]}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">LEP</label>
                      <input type="number" defaultValue={data.patrimoine.lep || ""} onBlur={e => updatePatrimoine("lep", e.target.value)} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right text-white text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">PEA</label>
                      <input type="number" defaultValue={data.patrimoine.pea || ""} onBlur={e => updatePatrimoine("pea", e.target.value)} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right text-white text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-sm font-semibold mb-3 text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Santé budgétaire
                </h2>
                <HealthCalendar />
                <div className="flex justify-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-600" />Excédent</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-600" />Serré</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-600" />Déficit</div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700 grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Total revenus:</div>
                  <div className="text-right text-green-400 font-semibold">{formatMoney(allMonthsCalculs.reduce((s, m) => s + m.ca, 0))}</div>
                  <div className="text-gray-400">Total épargne:</div>
                  <div className="text-right text-orange-400 font-semibold">{formatMoney(allMonthsCalculs.reduce((s, m) => s + m.epargne, 0))}</div>
                  <div className="text-gray-400">Solde annuel:</div>
                  <div className={"text-right font-semibold " + (allMonthsCalculs.reduce((s, m) => s + m.soldeFinal, 0) >= 0 ? "text-blue-400" : "text-red-400")}>
                    {formatMoney(allMonthsCalculs.reduce((s, m) => s + m.soldeFinal, 0))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section Prévu vs Réalisé */}
            {annualStats.prevu.revenus > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-sm font-semibold mb-3 text-center text-gray-300 flex items-center justify-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Budget Prévu vs Réalisé — {selectedYear}
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: "Revenus", prevu: annualStats.prevu.revenus, realise: annualStats.realise.revenus },
                    { name: "Besoins", prevu: annualStats.prevu.besoins, realise: annualStats.realise.besoins },
                    { name: "Dettes", prevu: annualStats.prevu.dettes, realise: annualStats.realise.dettes },
                    { name: "Épargne", prevu: annualStats.prevu.epargne, realise: annualStats.realise.epargne },
                    { name: "Envies", prevu: annualStats.prevu.envies, realise: annualStats.realise.envies },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} formatter={v => formatMoney(v)} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar dataKey="prevu" name="Prévu" fill="#6366F1" />
                    <Bar dataKey="realise" name="Réalisé" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                  {[
                    { label: "Revenus", prevu: annualStats.prevu.revenus, realise: annualStats.realise.revenus, good: true },
                    { label: "Besoins", prevu: annualStats.prevu.besoins, realise: annualStats.realise.besoins, good: false },
                    { label: "Dettes", prevu: annualStats.prevu.dettes, realise: annualStats.realise.dettes, good: false },
                    { label: "Épargne", prevu: annualStats.prevu.epargne, realise: annualStats.realise.epargne, good: true },
                    { label: "Envies", prevu: annualStats.prevu.envies, realise: annualStats.realise.envies, good: false },
                    { label: "Solde", prevu: annualStats.prevu.solde, realise: annualStats.realise.solde, good: true },
                  ].map((item, i) => {
                    const diff = item.realise - item.prevu;
                    const isPositive = item.good ? diff >= 0 : diff <= 0;
                    return (
                      <div key={i} className="bg-gray-700 rounded p-2">
                        <div className="text-gray-400 mb-1">{item.label}</div>
                        <div className="flex justify-between">
                          <span className="text-indigo-400">{formatMoney(item.prevu)}</span>
                          <span className={isPositive ? "text-green-400" : "text-red-400"}>{formatMoney(item.realise)}</span>
                        </div>
                        <div className={`text-right text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}>
                          {diff >= 0 ? "+" : ""}{formatMoney(diff)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <h2 className="text-base font-semibold mb-2 text-green-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  1. REVENUS
                </h2>
                <div className="space-y-1">
                  <InputRow label="Revenus activité" icon={Briefcase} value={data.revenus.activite} onChange={v => updateRevenus("activite", v)} />
                  <InputRow label="Revenus sociaux" icon={Users} value={data.revenus.sociaux} onChange={v => updateRevenus("sociaux", v)} />
                  <InputRow label="Intérêts / Avantages" icon={Coins} value={data.revenus.interets} onChange={v => updateRevenus("interets", v)} />
                  <InputRow label="Flux internes" icon={ArrowRightLeft} value={data.revenus.fluxInternes} onChange={v => updateRevenus("fluxInternes", v)} className="text-gray-400" />
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between text-green-400 font-semibold text-sm">
                  <span>CA</span><span>{formatMoney(calculs.ca)}</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <h2 className="text-base font-semibold mb-2 text-gray-300 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  2. BESOINS
                </h2>
                <div className="space-y-1">
                  <InputRow label="Charges fixes" value={data.sorties.besoins.fixes} onChange={v => updateSorties("besoins", "fixes", v)} />
                  <InputRow label="Charges variables" value={data.sorties.besoins.variables} onChange={v => updateSorties("besoins", "variables", v)} />
                  <InputRow label="Nécessité" value={data.sorties.besoins.necessite} onChange={v => updateSorties("besoins", "necessite", v)} />
                </div>
                <ResultRow label="Total" value={calculs.totalBesoins} pct={calculs.pctBesoins} formatMoney={formatMoney} formatPct={formatPct} />
                <StatusIndicator label="Santé Besoins" pct={calculs.pctBesoins} zones={ZONES_CONFIG.besoins} />
                <ResultRow label="→ Solde" value={calculs.soldeApresBesoins} highlight formatMoney={formatMoney} formatPct={formatPct} />
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <h2 className="text-base font-semibold mb-2 text-blue-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  3. DETTES
                </h2>
                <div className="space-y-1">
                  <InputRow label="Crédit immobilier" icon={Home} value={data.sorties.dettes.creditImmo} onChange={v => updateSorties("dettes", "creditImmo", v)} />
                  <InputRow label="Crédit auto" icon={Car} value={data.sorties.dettes.creditAuto} onChange={v => updateSorties("dettes", "creditAuto", v)} />
                  <InputRow label="Autres (impôts...)" icon={CreditCard} value={data.sorties.dettes.autres} onChange={v => updateSorties("dettes", "autres", v)} />
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 text-xs flex justify-between text-gray-400">
                  <span>Seuil MAX (10%)</span><span>{formatMoney(calculs.seuilMaxDettes)}</span>
                </div>
                <ResultRow label="Total" value={calculs.totalDettes} pct={calculs.pctDettes} alert={calculs.alerteDettes} alertMessage=">10%" formatMoney={formatMoney} formatPct={formatPct} />
                <StatusIndicator label="Santé Dettes" pct={calculs.pctDettes} zones={ZONES_CONFIG.dettes} />
                <ResultRow label="→ Solde" value={calculs.soldeApresDettes} highlight formatMoney={formatMoney} formatPct={formatPct} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <h2 className="text-base font-semibold mb-2 text-orange-400 flex items-center gap-2">
                  <PiggyBank className="w-4 h-4" />
                  4. ÉPARGNE
                </h2>
                <div className="space-y-1">
                  <InputRow label="Livret (LEP)" icon={Wallet} value={data.sorties.epargne.livret} onChange={v => updateSorties("epargne", "livret", v)} />
                  <InputRow label="Placement (PEA)" icon={TrendingUp} value={data.sorties.epargne.placement} onChange={v => updateSorties("epargne", "placement", v)} />
                  <InputRow label="Invest. personnel" icon={BookOpen} value={data.sorties.epargne.investPerso} onChange={v => updateSorties("epargne", "investPerso", v)} />
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 text-xs flex justify-between text-gray-400">
                  <span>Objectif ({formatPct(data.levier)})</span><span>{formatMoney(calculs.epargneObjectif)}</span>
                </div>
                <ResultRow label="Total" value={calculs.totalEpargne} pct={calculs.pctEpargne} alert={calculs.alerteEpargneMin || calculs.alerteEpargneMax} alertMessage={calculs.alerteEpargneMin ? "<5%" : ">20%"} target="5-20%" formatMoney={formatMoney} formatPct={formatPct} />
                <StatusIndicator label="Santé Épargne" pct={calculs.pctEpargne} zones={ZONES_CONFIG.epargne} />
                <ResultRow label="→ Solde" value={calculs.soldeApresEpargne} highlight formatMoney={formatMoney} formatPct={formatPct} />
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <h2 className="text-base font-semibold mb-2 text-red-400 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  5. ENVIES
                </h2>
                <div className="space-y-1">
                  <InputRow label="Fourmilles" value={data.sorties.envies.fourmilles} onChange={v => updateSorties("envies", "fourmilles", v)} />
                  <InputRow label="Occasionnel" icon={Gift} value={data.sorties.envies.occasionnel} onChange={v => updateSorties("envies", "occasionnel", v)} />
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 text-xs flex justify-between text-gray-400">
                  <span>Objectif ({formatPct(1 - data.levier)})</span><span>{formatMoney(calculs.enviesObjectif)}</span>
                </div>
                <ResultRow label="Total" value={calculs.totalEnvies} pct={calculs.pctEnvies} alert={calculs.alerteEnviesMax} alertMessage=">30%" target="10-30%" formatMoney={formatMoney} formatPct={formatPct} />
                <StatusIndicator label="Santé Envies" pct={calculs.pctEnvies} zones={ZONES_CONFIG.envies} />
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <h2 className="text-base font-semibold mb-2 text-purple-400 flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  LEVIER
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 text-xs flex items-center gap-1"><PiggyBank className="w-3 h-3" /></span>
                  <input type="range" min="0" max="1" step="0.001" value={data.levier} onChange={e => updateLevier(e.target.value)} className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  <span className="text-red-400 text-xs flex items-center gap-1"><Gift className="w-3 h-3" /></span>
                </div>
                <div className="text-center mt-1 text-purple-300 text-xs">
                  {formatPct(data.levier)} Épargne | {formatPct(1 - data.levier)} Envies
                </div>

                {calculs.soldeApresDettes > 0 && calculs.ca > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-700 rounded p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-orange-400 text-xs font-semibold flex items-center gap-1"><PiggyBank className="w-3 h-3" /> Épargne</span>
                          <span className="text-white text-xs font-bold">{formatMoney(calculs.epargneObjectif)}</span>
                        </div>
                        <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden mb-1">
                          <div className="absolute h-full bg-green-900 opacity-50" style={{ left: "5%", width: "15%" }} />
                          <div className={"absolute h-full w-1 " + (calculs.pctEpargneObjectif >= 5 && calculs.pctEpargneObjectif <= 20 ? "bg-green-400" : "bg-red-400")}
                            style={{ left: Math.min(calculs.pctEpargneObjectif, 100) + "%", transform: "translateX(-50%)" }} />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">0%</span>
                          <span className={calculs.pctEpargneObjectif >= 5 && calculs.pctEpargneObjectif <= 20 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                            {calculs.pctEpargneObjectif.toFixed(1)}%
                          </span>
                          <span className="text-gray-500">50%</span>
                        </div>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-red-400 text-xs font-semibold flex items-center gap-1"><Gift className="w-3 h-3" /> Envies</span>
                          <span className="text-white text-xs font-bold">{formatMoney(calculs.enviesObjectif)}</span>
                        </div>
                        <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden mb-1">
                          <div className="absolute h-full bg-green-900 opacity-50" style={{ left: "10%", width: "20%" }} />
                          <div className={"absolute h-full w-1 " + (calculs.pctEnviesObjectif >= 10 && calculs.pctEnviesObjectif <= 30 ? "bg-green-400" : "bg-red-400")}
                            style={{ left: Math.min(calculs.pctEnviesObjectif, 100) + "%", transform: "translateX(-50%)" }} />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">0%</span>
                          <span className={calculs.pctEnviesObjectif >= 10 && calculs.pctEnviesObjectif <= 30 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                            {calculs.pctEnviesObjectif.toFixed(1)}%
                          </span>
                          <span className="text-gray-500">50%</span>
                        </div>
                      </div>
                    </div>
                    <div className={"mt-2 p-2 rounded text-center text-xs flex items-center justify-center gap-1 " + (
                      calculs.pctEpargneObjectif >= 5 && calculs.pctEpargneObjectif <= 20 &&
                      calculs.pctEnviesObjectif >= 10 && calculs.pctEnviesObjectif <= 30
                        ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"
                    )}>
                      {calculs.pctEpargneObjectif >= 5 && calculs.pctEpargneObjectif <= 20 &&
                       calculs.pctEnviesObjectif >= 10 && calculs.pctEnviesObjectif <= 30
                        ? <><Check className="w-3 h-3" /> Répartition équilibrée !</>
                        : <><AlertTriangle className="w-3 h-3" /> Ajustez le levier</>}
                    </div>
                  </div>
                )}
              </div>

              <div className={"rounded-lg p-3 " + (calculs.soldeFinal >= 0 ? "bg-green-900" : "bg-red-900")}>
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    SOLDE FINAL
                  </span>
                  <span className={"text-xl font-bold " + (calculs.soldeFinal >= 0 ? "text-green-400" : "text-red-400")}>
                    {formatMoney(calculs.soldeFinal)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-300 flex items-center gap-1">
                  {calculs.soldeFinal >= 0 ? <><Check className="w-3 h-3" /> Budget équilibré</> : <><X className="w-3 h-3" /> Dépassement</>}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
          <HardDrive className="w-3 h-3" />
          Phase 7.0 — Budget Prévu + Thème
        </div>
      </div>

      {/* Modal Paramètres */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Paramètres & Objectifs">
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Objectifs Patrimoine
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">LEP (€)</label>
                <input type="number" value={objectifs.lep} onChange={e => setObjectifs(prev => ({ ...prev, lep: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400">PEA (€)</label>
                <input type="number" value={objectifs.pea} onChange={e => setObjectifs(prev => ({ ...prev, pea: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              Seuils d'alerte
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Seuil max dettes (%)</label>
                <input type="number" min="0" max="100" value={objectifs.seuilDettes} onChange={e => setObjectifs(prev => ({ ...prev, seuilDettes: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Épargne min (%)</label>
                  <input type="number" min="0" max="100" value={objectifs.epargneMin} onChange={e => setObjectifs(prev => ({ ...prev, epargneMin: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Épargne max (%)</label>
                  <input type="number" min="0" max="100" value={objectifs.epargneMax} onChange={e => setObjectifs(prev => ({ ...prev, epargneMax: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">Envies min (%)</label>
                  <input type="number" min="0" max="100" value={objectifs.enviesMin} onChange={e => setObjectifs(prev => ({ ...prev, enviesMin: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Envies max (%)</label>
                  <input type="number" min="0" max="100" value={objectifs.enviesMax} onChange={e => setObjectifs(prev => ({ ...prev, enviesMax: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={objectifs.alertesActives} onChange={e => setObjectifs(prev => ({ ...prev, alertesActives: e.target.checked }))}
                className="w-4 h-4 rounded bg-gray-600 border-gray-500" />
              <span className="text-sm flex items-center gap-2">
                {objectifs.alertesActives ? <Bell className="w-4 h-4 text-green-400" /> : <BellOff className="w-4 h-4 text-gray-400" />}
                Alertes actives
              </span>
            </label>
          </div>

          <button onClick={() => { if (window.confirm("Réinitialiser tous les paramètres par défaut ?")) { setObjectifs(DEFAULT_OBJECTIFS); showNotification("Paramètres réinitialisés", "success"); } }}
            className="w-full py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm">
            Réinitialiser par défaut
          </button>
        </div>
      </Modal>

      {/* Modal Transactions */}
      <Modal isOpen={!!showTransactions} onClose={() => setShowTransactions(null)} title={`Transactions — ${showTransactions ? MONTHS[showTransactions.month] : ""}`} size="lg">
        {showTransactions && (
          <div>
            <div className="mb-3 text-sm text-gray-400">
              {showTransactions.section === "revenus" ? "Revenus" : showTransactions.category} {showTransactions.subcategory ? `> ${showTransactions.subcategory}` : ""}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Nom</th>
                    <th className="pb-2 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => t.month === showTransactions.month &&
                      (showTransactions.section === "revenus"
                        ? t.section === "revenus" && t.category === showTransactions.category
                        : t.category === showTransactions.category && t.subcategory === showTransactions.subcategory))
                    .sort((a, b) => {
                      const da = parse(a.date, "dd/MM/yyyy", new Date());
                      const db = parse(b.date, "dd/MM/yyyy", new Date());
                      return db - da;
                    })
                    .map((t, i) => (
                      <tr key={i} className="border-b border-gray-700/50">
                        <td className="py-2 text-gray-300">{t.date}</td>
                        <td className="py-2 text-white truncate max-w-[200px]">{t.nom || "-"}</td>
                        <td className="py-2 text-right text-green-400">{formatMoney(t.montant)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {transactions.filter(t => t.month === showTransactions.month).length === 0 && (
                <div className="text-center py-8 animate-fadeIn">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">Aucune transaction importée</p>
                  <p className="text-xs text-gray-600 mt-1">Utilisez le bouton iCompta pour importer vos transactions</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Comparaison */}
      <Modal isOpen={showCompare} onClose={() => setShowCompare(false)} title="Comparaison de mois" size="lg">
        <div className="space-y-4">
          <div className="flex gap-4 justify-center">
            <select value={compareMonths[0]} onChange={e => setCompareMonths([parseInt(e.target.value), compareMonths[1]])}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <ArrowLeftRight className="w-6 h-6 text-gray-500 self-center" />
            <select value={compareMonths[1]} onChange={e => setCompareMonths([compareMonths[0], parseInt(e.target.value)])}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white">
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>

          {(() => {
            const m1 = monthsData[compareMonths[0]];
            const m2 = monthsData[compareMonths[1]];
            const calc = (m) => {
              const ca = m.revenus.activite + m.revenus.sociaux + m.revenus.interets;
              const besoins = m.sorties.besoins.fixes + m.sorties.besoins.variables + (m.sorties.besoins.necessite || 0);
              const dettes = m.sorties.dettes.creditImmo + m.sorties.dettes.creditAuto + m.sorties.dettes.autres;
              const epargne = m.sorties.epargne.livret + m.sorties.epargne.placement + m.sorties.epargne.investPerso;
              const envies = m.sorties.envies.fourmilles + m.sorties.envies.occasionnel;
              return { ca, besoins, dettes, epargne, envies, solde: ca - besoins - dettes - epargne - envies };
            };
            const c1 = calc(m1);
            const c2 = calc(m2);
            const diff = (a, b) => {
              const d = b - a;
              const pct = a !== 0 ? ((b - a) / Math.abs(a)) * 100 : 0;
              return { value: d, pct };
            };

            const rows = [
              { label: "Revenus", v1: c1.ca, v2: c2.ca, color: "text-green-400" },
              { label: "Besoins", v1: c1.besoins, v2: c2.besoins, color: "text-gray-400" },
              { label: "Dettes", v1: c1.dettes, v2: c2.dettes, color: "text-blue-400" },
              { label: "Épargne", v1: c1.epargne, v2: c2.epargne, color: "text-orange-400" },
              { label: "Envies", v1: c1.envies, v2: c2.envies, color: "text-red-400" },
              { label: "Solde", v1: c1.solde, v2: c2.solde, color: c2.solde >= 0 ? "text-green-400" : "text-red-400" },
            ];

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="pb-2 text-left">Catégorie</th>
                      <th className="pb-2 text-right">{MONTHS[compareMonths[0]]}</th>
                      <th className="pb-2 text-right">{MONTHS[compareMonths[1]]}</th>
                      <th className="pb-2 text-right">Diff (€)</th>
                      <th className="pb-2 text-right">Diff (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const d = diff(row.v1, row.v2);
                      return (
                        <tr key={i} className="border-b border-gray-700/50">
                          <td className={`py-2 font-medium ${row.color}`}>{row.label}</td>
                          <td className="py-2 text-right text-white">{formatMoney(row.v1)}</td>
                          <td className="py-2 text-right text-white">{formatMoney(row.v2)}</td>
                          <td className={`py-2 text-right ${d.value >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {d.value >= 0 ? "+" : ""}{formatMoney(d.value)}
                          </td>
                          <td className={`py-2 text-right ${d.pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {d.pct >= 0 ? "+" : ""}{d.pct.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </Modal>

      {/* Modal Budget Prévisionnel */}
      <Modal isOpen={showBudgetPrevu} onClose={() => setShowBudgetPrevu(false)} title={`Budget Prévisionnel — ${selectedYear}`} size="lg">
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Définissez vos objectifs mensuels pour comparer avec le réalisé.</p>

          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-green-400">
              <TrendingUp className="w-4 h-4" />
              Revenus mensuels prévus
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400">Activité</label>
                <input type="number" value={budgetPrevu.revenus.activite} onChange={e => setBudgetPrevu(prev => ({ ...prev, revenus: { ...prev.revenus, activite: parseFloat(e.target.value) || 0 } }))}
                  className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Sociaux</label>
                <input type="number" value={budgetPrevu.revenus.sociaux} onChange={e => setBudgetPrevu(prev => ({ ...prev, revenus: { ...prev.revenus, sociaux: parseFloat(e.target.value) || 0 } }))}
                  className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Intérêts</label>
                <input type="number" value={budgetPrevu.revenus.interets} onChange={e => setBudgetPrevu(prev => ({ ...prev, revenus: { ...prev.revenus, interets: parseFloat(e.target.value) || 0 } }))}
                  className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
              </div>
            </div>
            <div className="mt-2 text-right text-green-400 text-sm font-semibold">
              Total mensuel: {formatMoney(budgetPrevu.revenus.activite + budgetPrevu.revenus.sociaux + budgetPrevu.revenus.interets)}
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-300">
              <Home className="w-4 h-4" />
              Besoins mensuels prévus
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Fixes</label>
                <input type="number" value={budgetPrevu.besoins.fixes} onChange={e => setBudgetPrevu(prev => ({ ...prev, besoins: { ...prev.besoins, fixes: parseFloat(e.target.value) || 0 } }))}
                  className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Variables</label>
                <input type="number" value={budgetPrevu.besoins.variables} onChange={e => setBudgetPrevu(prev => ({ ...prev, besoins: { ...prev.besoins, variables: parseFloat(e.target.value) || 0 } }))}
                  className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
              </div>
            </div>
            <div className="mt-2 text-right text-gray-300 text-sm font-semibold">
              Total mensuel: {formatMoney(budgetPrevu.besoins.fixes + budgetPrevu.besoins.variables)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-blue-400">
                <CreditCard className="w-4 h-4" />
                Dettes
              </h4>
              <label className="text-xs text-gray-400">Total mensuel</label>
              <input type="number" value={budgetPrevu.dettes.total} onChange={e => setBudgetPrevu(prev => ({ ...prev, dettes: { total: parseFloat(e.target.value) || 0 } }))}
                className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-orange-400">
                <PiggyBank className="w-4 h-4" />
                Épargne
              </h4>
              <label className="text-xs text-gray-400">Total mensuel</label>
              <input type="number" value={budgetPrevu.epargne.total} onChange={e => setBudgetPrevu(prev => ({ ...prev, epargne: { total: parseFloat(e.target.value) || 0 } }))}
                className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-400">
                <Gift className="w-4 h-4" />
                Envies
              </h4>
              <label className="text-xs text-gray-400">Total mensuel</label>
              <input type="number" value={budgetPrevu.envies.total} onChange={e => setBudgetPrevu(prev => ({ ...prev, envies: { total: parseFloat(e.target.value) || 0 } }))}
                className="w-full px-2 py-1.5 bg-gray-600 border border-gray-500 rounded text-right text-white text-sm" />
            </div>
          </div>

          <div className="bg-indigo-900 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-indigo-300 font-semibold">Solde mensuel prévu</span>
              <span className={`font-bold ${(budgetPrevu.revenus.activite + budgetPrevu.revenus.sociaux + budgetPrevu.revenus.interets - budgetPrevu.besoins.fixes - budgetPrevu.besoins.variables - budgetPrevu.dettes.total - budgetPrevu.epargne.total - budgetPrevu.envies.total) >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatMoney(budgetPrevu.revenus.activite + budgetPrevu.revenus.sociaux + budgetPrevu.revenus.interets - budgetPrevu.besoins.fixes - budgetPrevu.besoins.variables - budgetPrevu.dettes.total - budgetPrevu.epargne.total - budgetPrevu.envies.total)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
              <span>Projection annuelle</span>
              <span>{formatMoney((budgetPrevu.revenus.activite + budgetPrevu.revenus.sociaux + budgetPrevu.revenus.interets - budgetPrevu.besoins.fixes - budgetPrevu.besoins.variables - budgetPrevu.dettes.total - budgetPrevu.epargne.total - budgetPrevu.envies.total) * 12)}</span>
            </div>
          </div>

          <button onClick={() => { if (window.confirm("Réinitialiser le budget prévisionnel ?")) { setBudgetPrevu(initializeBudgetPrevu()); showNotification("Budget prévisionnel réinitialisé", "success"); } }}
            className="w-full py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm">
            Réinitialiser
          </button>
        </div>
      </Modal>
    </div>
  );
}
