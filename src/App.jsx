import { useRef, useEffect, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { saveToStorage } from "./store/storage";
import { useBudgetStore } from "./store";
import { computeAllMonthsCalculs } from "./utils/calculations";

// Components
import { NotificationToast } from "./components/ui/NotificationToast";
import { LoadingOverlay } from "./components/ui/LoadingOverlay";
import { Onboarding } from "./components/onboarding/Onboarding";
import { KeyboardHelp } from "./components/onboarding/KeyboardHelp";
import { DesktopHeader } from "./components/layout/DesktopHeader";
import { MobileHeader } from "./components/layout/MobileHeader";
import { ImportStatsBar } from "./components/layout/ImportStatsBar";
import { MonthSelector } from "./components/layout/MonthSelector";
import { Footer } from "./components/layout/Footer";
import { DashboardView } from "./components/dashboard/DashboardView";
import { SaisieView } from "./components/saisie/SaisieView";
import { PatrimoineView } from "./components/patrimoine/PatrimoineView";
import { SettingsModal } from "./components/modals/SettingsModal";
import { TransactionsModal } from "./components/modals/TransactionsModal";
import { CompareModal } from "./components/modals/CompareModal";
import { BudgetPrevuModal } from "./components/modals/BudgetPrevuModal";

export default function BudgetApp() {
  const selectedYear = useBudgetStore(s => s.selectedYear);
  const currentMonth = useBudgetStore(s => s.currentMonth);
  const setCurrentMonth = useBudgetStore(s => s.setCurrentMonth);
  const monthsData = useBudgetStore(s => s.monthsData);
  const notification = useBudgetStore(s => s.notification);
  const setLastSaved = useBudgetStore(s => s.setLastSaved);
  const view = useBudgetStore(s => s.view);
  const setView = useBudgetStore(s => s.setView);
  const isImporting = useBudgetStore(s => s.isImporting);
  const showOnboarding = useBudgetStore(s => s.showOnboarding);
  const setShowOnboarding = useBudgetStore(s => s.setShowOnboarding);
  const showKeyboardHelp = useBudgetStore(s => s.showKeyboardHelp);
  const setShowKeyboardHelp = useBudgetStore(s => s.setShowKeyboardHelp);
  const showNotification = useBudgetStore(s => s.showNotification);
  const theme = useBudgetStore(s => s.theme);
  const toggleTheme = useBudgetStore(s => s.toggleTheme);
  const exportToCSV = useBudgetStore(s => s.exportToCSV);
  const handleFileUpload = useBudgetStore(s => s.handleFileUpload);
  const handleiComptaImport = useBudgetStore(s => s.handleiComptaImport);
  const handleLivretsImport = useBudgetStore(s => s.handleLivretsImport);
  const closeAllModals = useBudgetStore(s => s.closeAllModals);

  const fileInputRef = useRef(null);
  const iComptaInputRef = useRef(null);
  const livretsInputRef = useRef(null);

  const allMonthsCalculs = useMemo(() => computeAllMonthsCalculs(monthsData), [monthsData]);

  // Auto-save to localStorage when data changes
  useEffect(() => {
    const saved = saveToStorage(monthsData, selectedYear);
    if (saved) {
      setLastSaved(new Date());
    } else {
      showNotification("Erreur de sauvegarde - Espace disque insuffisant ?", "error", AlertTriangle);
    }
  }, [monthsData, selectedYear, setLastSaved, showNotification]);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', theme === 'light');
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      switch (key) {
        case 's': e.preventDefault(); setView('saisie'); break;
        case 'd': e.preventDefault(); setView('dashboard'); break;
        case 'p': e.preventDefault(); setView('patrimoine'); break;
        case 'arrowleft': e.preventDefault(); setCurrentMonth(currentMonth > 0 ? currentMonth - 1 : 11); break;
        case 'arrowright': e.preventDefault(); setCurrentMonth(currentMonth < 11 ? currentMonth + 1 : 0); break;
        case 'i': e.preventDefault(); iComptaInputRef.current?.click(); break;
        case 'e': e.preventDefault(); exportToCSV(); break;
        case 't': e.preventDefault(); toggleTheme(); break;
        case '?': e.preventDefault(); setShowKeyboardHelp(true); break;
        case 'escape': closeAllModals(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMonth, setCurrentMonth, setView, exportToCSV, toggleTheme, setShowKeyboardHelp, closeAllModals]);

  return (
    <div className="min-h-screen p-3 sm:p-6">
      <NotificationToast notification={notification} />
      <LoadingOverlay isVisible={isImporting} />
      <Onboarding isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} onComplete={() => setShowOnboarding(false)} />
      <KeyboardHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
      <input type="file" ref={iComptaInputRef} onChange={handleiComptaImport} accept=".csv" className="hidden" />
      <input type="file" ref={livretsInputRef} onChange={handleLivretsImport} accept=".csv" className="hidden" />

      <div className="max-w-6xl mx-auto">
        <DesktopHeader fileInputRef={fileInputRef} iComptaInputRef={iComptaInputRef} livretsInputRef={livretsInputRef} />
        <MobileHeader fileInputRef={fileInputRef} iComptaInputRef={iComptaInputRef} livretsInputRef={livretsInputRef} />
        <ImportStatsBar />
        <MonthSelector allMonthsCalculs={allMonthsCalculs} />

        {view === "dashboard" ? <DashboardView /> : view === "patrimoine" ? <PatrimoineView /> : <SaisieView />}

        <Footer />
      </div>

      <SettingsModal />
      <TransactionsModal />
      <CompareModal />
      <BudgetPrevuModal />
    </div>
  );
}
