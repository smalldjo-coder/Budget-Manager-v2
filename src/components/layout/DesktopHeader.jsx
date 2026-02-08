import {
  BarChart3, Pencil, TrendingUp, Download, Upload, Trash2,
  Smartphone, Save, RotateCcw, Settings, Sun, Moon, HelpCircle, ChevronDown, PiggyBank
} from "lucide-react";
import { AVAILABLE_YEARS } from "../../constants";
import { useBudgetStore } from "../../store";

export const DesktopHeader = ({ fileInputRef, iComptaInputRef, livretsInputRef }) => {
  const selectedYear = useBudgetStore(s => s.selectedYear);
  const setSelectedYear = useBudgetStore(s => s.setSelectedYear);
  const view = useBudgetStore(s => s.view);
  const setView = useBudgetStore(s => s.setView);
  const lastSaved = useBudgetStore(s => s.lastSaved);
  const theme = useBudgetStore(s => s.theme);
  const toggleTheme = useBudgetStore(s => s.toggleTheme);
  const exportToCSV = useBudgetStore(s => s.exportToCSV);
  const restoreFromStorage = useBudgetStore(s => s.restoreFromStorage);
  const resetAllData = useBudgetStore(s => s.resetAllData);
  const setShowSettings = useBudgetStore(s => s.setShowSettings);
  const setShowKeyboardHelp = useBudgetStore(s => s.setShowKeyboardHelp);

  return (
    <div className="hidden sm:flex justify-between items-center mb-4 flex-wrap gap-2">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <BarChart3 className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />
            Budget Manager
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Répartition intelligente par enveloppes</p>
        </div>
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="appearance-none px-3 py-1.5 pr-8 rounded-lg text-sm font-medium cursor-pointer text-white focus:outline-none"
            style={{ backgroundColor: 'var(--accent-blue)' }}
          >
            {AVAILABLE_YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap items-center">
        {lastSaved && (
          <span className="text-xs flex items-center gap-1 mr-1" style={{ color: 'var(--text-muted)' }}>
            <Save className="w-3 h-3" />
            {lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <button onClick={() => setView("saisie")} className={view === "saisie" ? "btn-primary" : "btn-secondary"}>
          <Pencil className="w-3 h-3" /> Saisie
        </button>
        <button onClick={() => setView("dashboard")} className={view === "dashboard" ? "btn-primary" : "btn-secondary"}>
          <TrendingUp className="w-3 h-3" /> Dashboard
        </button>
        <button onClick={() => setView("patrimoine")} className={view === "patrimoine" ? "btn-primary" : "btn-secondary"}>
          <PiggyBank className="w-3 h-3" /> Patrimoine
        </button>
        <div className="w-px mx-1 h-5" style={{ backgroundColor: 'var(--border-default)' }} />
        <button onClick={() => iComptaInputRef.current?.click()} className="btn-accent-purple">
          <Smartphone className="w-3 h-3" /> iCompta
        </button>
        <button onClick={() => livretsInputRef.current?.click()} className="btn-ghost" title="Import Livrets (iCompta)">
          <PiggyBank className="w-3 h-3" /> Livrets
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="btn-ghost">
          <Download className="w-3 h-3" /> CSV
        </button>
        <button onClick={exportToCSV} className="btn-ghost">
          <Upload className="w-3 h-3" /> Export
        </button>
        <button onClick={restoreFromStorage} className="btn-ghost" title="Restaurer depuis la sauvegarde">
          <RotateCcw className="w-3 h-3" />
        </button>
        <button onClick={resetAllData} className="btn-danger">
          <Trash2 className="w-3 h-3" />
        </button>
        <button onClick={() => setShowSettings(true)} className="btn-ghost" title="Paramètres">
          <Settings className="w-3 h-3" />
        </button>
        <button onClick={toggleTheme} className="btn-ghost" title="Changer de thème">
          {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
        </button>
        <button onClick={() => setShowKeyboardHelp(true)} className="btn-ghost" title="Raccourcis clavier (?)">
          <HelpCircle className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
