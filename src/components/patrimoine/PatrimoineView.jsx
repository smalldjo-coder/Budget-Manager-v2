import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { PiggyBank, TrendingUp, TrendingDown, Wallet, Target, Landmark, Edit3 } from "lucide-react";
import { MONTHS } from "../../constants";
import { formatMoney } from "../../utils/formatters";
import { computePatrimoineObjectifs, computePatrimoineEvolution } from "../../utils/calculations";
import { ProgressBar } from "../ui/ProgressBar";
import { useBudgetStore } from "../../store";

const LivretCard = ({ name, icon: Icon, solde, prevSolde, objectif, color }) => {
  const evolution = solde - prevSolde;
  const pct = objectif > 0 ? Math.min((solde / objectif) * 100, 100) : 0;

  return (
    <div className="card p-5 card-hover">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>{name}</h3>
          </div>
        </div>
        {evolution !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-medium ${evolution > 0 ? "text-green-400" : "text-red-400"}`}>
            {evolution > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {evolution > 0 ? "+" : ""}{formatMoney(evolution)}
          </div>
        )}
      </div>

      <div className="text-2xl font-bold tabular-nums mb-3" style={{ color }}>
        {formatMoney(solde)}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: 'var(--text-muted)' }}>Objectif: {formatMoney(objectif)}</span>
          <span className="font-medium tabular-nums" style={{ color: pct >= 100 ? 'var(--accent-emerald)' : color }}>{pct.toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-selected)' }}>
          <div className="h-full rounded-full progress-bar" style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? 'var(--accent-emerald)' : color }} />
        </div>
      </div>
    </div>
  );
};

export const PatrimoineView = () => {
  const currentMonth = useBudgetStore(s => s.currentMonth);
  const monthsData = useBudgetStore(s => s.monthsData);
  const selectedYear = useBudgetStore(s => s.selectedYear);
  const soldesInitiaux = useBudgetStore(s => s.soldesInitiaux);
  const updateSoldeInitial = useBudgetStore(s => s.updateSoldeInitial);
  const updatePatrimoine = useBudgetStore(s => s.updatePatrimoine);

  const data = monthsData[currentMonth];
  // For January, compare against soldesInitiaux; otherwise compare against previous month
  const prevSoldes = currentMonth > 0
    ? { lep: monthsData[currentMonth - 1].patrimoine.lep || 0, livretA: monthsData[currentMonth - 1].patrimoine.livretA || 0, pea: monthsData[currentMonth - 1].patrimoine.pea || 0 }
    : { lep: soldesInitiaux.lep || 0, livretA: soldesInitiaux.livretA || 0, pea: soldesInitiaux.pea || 0 };

  const objectifsDyn = useMemo(() => computePatrimoineObjectifs(monthsData), [monthsData]);
  const evolutionData = useMemo(() => computePatrimoineEvolution(monthsData), [monthsData]);

  const totalSolde = (data.patrimoine.lep || 0) + (data.patrimoine.livretA || 0) + (data.patrimoine.pea || 0);
  const prevTotalSolde = prevSoldes.lep + prevSoldes.livretA + prevSoldes.pea;
  const totalEvolution = totalSolde - prevTotalSolde;
  const totalObjectif = objectifsDyn.lep + objectifsDyn.livretA + objectifsDyn.pea;
  const totalPct = totalObjectif > 0 ? Math.min((totalSolde / totalObjectif) * 100, 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header - Solde total */}
      <div className="card p-6" style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--bg-input))' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)' }}>
            <PiggyBank className="w-5 h-5" style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Patrimoine Épargne Total</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{MONTHS[currentMonth]} {selectedYear}</p>
          </div>
        </div>

        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-3xl font-bold tabular-nums" style={{ color: 'var(--accent-emerald)' }}>
              {formatMoney(totalSolde)}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Objectif: {formatMoney(totalObjectif)} ({totalPct.toFixed(1)}%)
            </div>
          </div>
          {totalEvolution !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium ${totalEvolution > 0 ? "text-green-400" : "text-red-400"}`}>
              {totalEvolution > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {totalEvolution > 0 ? "+" : ""}{formatMoney(totalEvolution)}
            </div>
          )}
        </div>

        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-selected)' }}>
          <div className="h-full rounded-full progress-bar" style={{ width: `${totalPct}%`, backgroundColor: 'var(--accent-emerald)' }} />
        </div>
      </div>

      {/* Solde initial au 01/01 */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
          <Edit3 className="w-4 h-4" />
          Solde initial au 01/01/{selectedYear}
        </h2>
        <div className="text-xs mb-3 p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
          Saisissez le solde réel de chaque livret au 1er janvier. Calculé automatiquement lors d'un import livrets multi-années.
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#4f7df5' }}>LEP</label>
            <input
              type="number"
              step="0.01"
              defaultValue={soldesInitiaux.lep || ""}
              onBlur={e => updateSoldeInitial("lep", e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-lg text-right text-sm tabular-nums"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#8b5cf6' }}>Livret A</label>
            <input
              type="number"
              step="0.01"
              defaultValue={soldesInitiaux.livretA || ""}
              onBlur={e => updateSoldeInitial("livretA", e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-lg text-right text-sm tabular-nums"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#f59e0b' }}>PEA</label>
            <input
              type="number"
              step="0.01"
              defaultValue={soldesInitiaux.pea || ""}
              onBlur={e => updateSoldeInitial("pea", e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-lg text-right text-sm tabular-nums"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* 3 Livret Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <LivretCard
          name="LEP (Précaution)"
          icon={Wallet}
          solde={data.patrimoine.lep || 0}
          prevSolde={prevSoldes.lep}
          objectif={objectifsDyn.lep}
          color="#4f7df5"
        />
        <LivretCard
          name="Livret A (Précaution)"
          icon={Landmark}
          solde={data.patrimoine.livretA || 0}
          prevSolde={prevSoldes.livretA}
          objectif={objectifsDyn.livretA}
          color="#8b5cf6"
        />
        <LivretCard
          name="PEA (Long terme)"
          icon={TrendingUp}
          solde={data.patrimoine.pea || 0}
          prevSolde={prevSoldes.pea}
          objectif={objectifsDyn.pea}
          color="#f59e0b"
        />
      </div>

      {/* Saisie manuelle du solde mensuel */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
          <Edit3 className="w-4 h-4" />
          Solde fin {MONTHS[currentMonth]} {selectedYear}
        </h2>
        <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Solde réel de chaque livret à la fin du mois (mis à jour automatiquement par l'import, ou saisissable manuellement).
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#4f7df5' }}>LEP</label>
            <input
              type="number"
              step="0.01"
              key={`lep-${currentMonth}`}
              defaultValue={data.patrimoine.lep || ""}
              onBlur={e => updatePatrimoine("lep", e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-lg text-right text-sm tabular-nums"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#8b5cf6' }}>Livret A</label>
            <input
              type="number"
              step="0.01"
              key={`livretA-${currentMonth}`}
              defaultValue={data.patrimoine.livretA || ""}
              onBlur={e => updatePatrimoine("livretA", e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-lg text-right text-sm tabular-nums"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#f59e0b' }}>PEA</label>
            <input
              type="number"
              step="0.01"
              key={`pea-${currentMonth}`}
              defaultValue={data.patrimoine.pea || ""}
              onBlur={e => updatePatrimoine("pea", e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-lg text-right text-sm tabular-nums"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* Graphique d'évolution */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4 text-center flex items-center justify-center gap-2 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
          <Target className="w-4 h-4" />
          Évolution Patrimoine — {selectedYear}
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={evolutionData}>
            <defs>
              <linearGradient id="colorLep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f7df5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f7df5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLivretA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" strokeOpacity={0.5} />
            <XAxis dataKey="mois" tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: 'Inter' }} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: 'Inter' }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }} formatter={v => formatMoney(v)} />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            <Area type="monotone" dataKey="lep" name="LEP" stroke="#4f7df5" fill="url(#colorLep)" strokeWidth={2} />
            <Area type="monotone" dataKey="livretA" name="Livret A" stroke="#8b5cf6" fill="url(#colorLivretA)" strokeWidth={2} />
            <Area type="monotone" dataKey="pea" name="PEA" stroke="#f59e0b" fill="url(#colorPea)" strokeWidth={2} />
            <Line type="monotone" dataKey="total" name="Total" stroke="#34d399" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Objectifs détaillés */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
          <Target className="w-4 h-4" />
          Objectifs Dynamiques
        </h2>
        <div className="text-xs mb-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
          LEP = 6 mois de charges, Livret A = 3 mois de charges, PEA = 12 mois de revenus d'activité.
        </div>
        <ProgressBar label="LEP (6 mois de charges)" current={data.patrimoine.lep || 0} target={objectifsDyn.lep} icon={Wallet} formatMoney={formatMoney} />
        <ProgressBar label="Livret A (3 mois de charges)" current={data.patrimoine.livretA || 0} target={objectifsDyn.livretA} icon={Landmark} formatMoney={formatMoney} />
        <ProgressBar label="PEA (12 mois d'activité)" current={data.patrimoine.pea || 0} target={objectifsDyn.pea} icon={TrendingUp} formatMoney={formatMoney} />
      </div>
    </div>
  );
};
