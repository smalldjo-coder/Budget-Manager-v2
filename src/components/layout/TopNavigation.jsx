import { Bell, User, Pencil, TrendingUp, PiggyBank, Settings, LayoutDashboard, Users } from "lucide-react";
import { useBudgetStore } from "../../store";

export const TopNavigation = () => {
  const view = useBudgetStore(s => s.view);
  const setView = useBudgetStore(s => s.setView);
  const setShowSettings = useBudgetStore(s => s.setShowSettings);

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Header Row: Logo & Profile */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-blue flex items-center justify-center text-white shadow-glow-blue shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20"></div>
            <span className="font-bold text-lg relative z-10">B</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-text-heading flex items-center gap-1.5 leading-none">
              Budget Manager
              <span className="text-accent-blue font-semibold italic text-lg">v2</span>
            </h1>
            <span className="text-[10px] uppercase tracking-widest font-bold text-accent-blue mt-0.5">Premium Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-text-secondary hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-accent-rose rounded-full"></span>
          </button>
          <div className="w-9 h-9 rounded-full bg-surface-300 border border-border-default overflow-hidden cursor-pointer hover:border-border-strong transition-colors flex items-center justify-center">
            <User className="w-5 h-5 text-text-muted" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs Row */}
      <div className="flex items-center justify-center">
        <div className="bg-surface-200/50 backdrop-blur-md p-1.5 rounded-2xl flex gap-1 border border-border-subtle w-full max-w-3xl">
          <button
            onClick={() => setView("saisie")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 ${
              view === "saisie"
                ? "bg-accent-blue text-white shadow-glow-blue shadow-md"
                : "text-text-secondary hover:text-white hover:bg-surface-200"
            }`}
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Saisie</span>
          </button>
          <button
            onClick={() => setView("dashboard")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 ${
              view === "dashboard"
                ? "bg-accent-blue text-white shadow-glow-blue shadow-md"
                : "text-text-secondary hover:text-white hover:bg-surface-200"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Analyses</span>
          </button>
          <button
            onClick={() => setView("patrimoine")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 ${
              view === "patrimoine"
                ? "bg-accent-blue text-white shadow-glow-blue shadow-md"
                : "text-text-secondary hover:text-white hover:bg-surface-200"
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span className="hidden sm:inline">Objectifs</span>
          </button>
          <button
            onClick={() => setView("partage")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 ${
              view === "partage"
                ? "bg-accent-purple text-white shadow-md"
                : "text-text-secondary hover:text-white hover:bg-surface-200"
            }`}
            style={view === "partage" ? { boxShadow: '0 0 20px -5px rgba(139, 92, 246, 0.4)' } : {}}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Partage</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 text-text-secondary hover:text-white hover:bg-surface-200"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </button>
        </div>
      </div>
    </div>
  );
};
