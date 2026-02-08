import {
  BarChart3, Pencil, TrendingUp, Download, Upload, Trash2,
  Smartphone, X, Save, RotateCcw, Settings, Sun, Moon, HelpCircle, PiggyBank
} from "lucide-react";
import { AVAILABLE_YEARS } from "../../constants";
import { useBudgetStore } from "../../store";

export const MobileHeader = ({ fileInputRef, iComptaInputRef, livretsInputRef }) => {
  const selectedYear = useBudgetStore(s => s.selectedYear);
  const setSelectedYear = useBudgetStore(s => s.setSelectedYear);
  const view = useBudgetStore(s => s.view);
  const setView = useBudgetStore(s => s.setView);
  const mobileMenuOpen = useBudgetStore(s => s.mobileMenuOpen);
  const setMobileMenuOpen = useBudgetStore(s => s.setMobileMenuOpen);
  const lastSaved = useBudgetStore(s => s.lastSaved);
  const theme = useBudgetStore(s => s.theme);
  const toggleTheme = useBudgetStore(s => s.toggleTheme);
  const exportToCSV = useBudgetStore(s => s.exportToCSV);
  const restoreFromStorage = useBudgetStore(s => s.restoreFromStorage);
  const resetAllData = useBudgetStore(s => s.resetAllData);
  const setShowSettings = useBudgetStore(s => s.setShowSettings);
  const setShowKeyboardHelp = useBudgetStore(s => s.setShowKeyboardHelp);

  return (
    <div className="sm:hidden mb-3">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
          <span className="font-semibold" style={{ color: 'var(--text-heading)' }}>Budget</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="px-2 py-0.5 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--accent-blue)' }}
          >
            {AVAILABLE_YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)' }}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation tabs mobile */}
      <div className="flex gap-1.5 mb-2">
        <button onClick={() => setView("saisie")} className={"flex-1 py-2.5 rounded-lg text-sm font-medium transition-all " + (view === "saisie" ? "btn-primary justify-center" : "btn-secondary justify-center")}>
          <Pencil className="w-4 h-4 mx-auto mb-0.5" />
          Saisie
        </button>
        <button onClick={() => setView("dashboard")} className={"flex-1 py-2.5 rounded-lg text-sm font-medium transition-all " + (view === "dashboard" ? "btn-primary justify-center" : "btn-secondary justify-center")}>
          <TrendingUp className="w-4 h-4 mx-auto mb-0.5" />
          Dashboard
        </button>
        <button onClick={() => setView("patrimoine")} className={"flex-1 py-2.5 rounded-lg text-sm font-medium transition-all " + (view === "patrimoine" ? "btn-primary justify-center" : "btn-secondary justify-center")}>
          <PiggyBank className="w-4 h-4 mx-auto mb-0.5" />
          Patrimoine
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {mobileMenuOpen && (
        <div className="card rounded-xl p-3 mb-3 grid grid-cols-3 gap-2 animate-slideDown">
          <button onClick={() => { iComptaInputRef.current?.click(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-colors" style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#c4b5fd' }}>
            <Smartphone className="w-4 h-4" />
            iCompta
          </button>
          <button onClick={() => { livretsInputRef.current?.click(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-colors" style={{ backgroundColor: 'rgba(52, 211, 153, 0.12)', color: '#6ee7b7' }}>
            <PiggyBank className="w-4 h-4" />
            Livrets
          </button>
          <button onClick={() => { fileInputRef.current?.click(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-colors" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
            <Download className="w-4 h-4" />
            Import
          </button>
          <button onClick={() => { exportToCSV(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-colors" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
            <Upload className="w-4 h-4" />
            Export
          </button>
          <button onClick={() => { restoreFromStorage(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-colors" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
            <RotateCcw className="w-4 h-4" />
            Restaurer
          </button>
          <button onClick={() => { resetAllData(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs btn-danger justify-center">
            <Trash2 className="w-4 h-4" />
            Reset
          </button>
          <button onClick={() => { setShowSettings(true); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-colors" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
            <Settings className="w-4 h-4" />
            Config
          </button>
          <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-colors" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            Thème
          </button>
          <button onClick={() => { setShowKeyboardHelp(true); setMobileMenuOpen(false); }} className="flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-colors" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
            <HelpCircle className="w-4 h-4" />
            Aide
          </button>
          {lastSaved && (
            <div className="flex flex-col items-center gap-1 p-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Save className="w-4 h-4" />
              {lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
