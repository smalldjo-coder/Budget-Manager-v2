import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { PiggyBank, TrendingUp, TrendingDown, Wallet, Target, Landmark } from "lucide-react";
import { MONTHS } from "../../constants";
import { formatMoney } from "../../utils/formatters";
import { computePatrimoineObjectifs, computePatrimoineEvolution } from "../../utils/calculations";
import { ProgressBar } from "../ui/ProgressBar";
import { useBudgetStore } from "../../store";

const LivretCard = ({ name, icon: Icon, solde, prevSolde, objectif, color, detail }) => {
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

      {detail && (
        <div className="grid grid-cols-3 gap-2 text-xs pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="text-center">
            <div style={{ color: 'var(--text-muted)' }}>Versements</div>
            <div className="font-medium text-green-400 tabular-nums">{formatMoney(detail.versements)}</div>
          </div>
          <div className="text-center">
            <div style={{ color: 'var(--text-muted)' }}>Retraits</div>
            <div className="font-medium text-red-400 tabular-nums">{formatMoney(detail.retraits)}</div>
          </div>
          <div className="text-center">
            <div style={{ color: 'var(--text-muted)' }}>Intérêts</div>
            <div className="font-medium text-amber-400 tabular-nums">{formatMoney(detail.interets)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PatrimoineView = () => {
  const currentMonth = useBudgetStore(s => s.currentMonth);
  const monthsData = useBudgetStore(s => s.monthsData);

  const data = monthsData[currentMonth];
  const prevData = currentMonth > 0 ? monthsData[currentMonth - 1] : null;

  const objectifsDyn = useMemo(() => computePatrimoineObjectifs(monthsData), [monthsData]);
  const evolutionData = useMemo(() => computePatrimoineEvolution(monthsData), [monthsData]);

  const totalSolde = (data.patrimoine.lep || 0) + (data.patrimoine.livretA || 0) + (data.patrimoine.pea || 0);
  const prevTotalSolde = prevData
    ? (prevData.patrimoine.lep || 0) + (prevData.patrimoine.livretA || 0) + (prevData.patrimoine.pea || 0)
    : 0;
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
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{MONTHS[currentMonth]}</p>
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

      {/* 3 Livret Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <LivretCard
          name="LEP (Précaution)"
          icon={Wallet}
          solde={data.patrimoine.lep || 0}
          prevSolde={prevData ? (prevData.patrimoine.lep || 0) : 0}
          objectif={objectifsDyn.lep}
          color="#4f7df5"
        />
        <LivretCard
          name="Livret A (Précaution)"
          icon={Landmark}
          solde={data.patrimoine.livretA || 0}
          prevSolde={prevData ? (prevData.patrimoine.livretA || 0) : 0}
          objectif={objectifsDyn.livretA}
          color="#8b5cf6"
        />
        <LivretCard
          name="PEA (Long terme)"
          icon={TrendingUp}
          solde={data.patrimoine.pea || 0}
          prevSolde={prevData ? (prevData.patrimoine.pea || 0) : 0}
          objectif={objectifsDyn.pea}
          color="#f59e0b"
        />
      </div>

      {/* Graphique d'évolution */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4 text-center flex items-center justify-center gap-2 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
          <Target className="w-4 h-4" />
          Évolution Patrimoine — 12 mois
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
          Les objectifs sont calculés automatiquement : LEP = 6 mois de charges, Livret A = 3 mois de charges, PEA = 12 mois de revenus d'activité.
        </div>
        <ProgressBar label="LEP (6 mois de charges)" current={data.patrimoine.lep || 0} target={objectifsDyn.lep} icon={Wallet} formatMoney={formatMoney} />
        <ProgressBar label="Livret A (3 mois de charges)" current={data.patrimoine.livretA || 0} target={objectifsDyn.livretA} icon={Landmark} formatMoney={formatMoney} />
        <ProgressBar label="PEA (12 mois d'activité)" current={data.patrimoine.pea || 0} target={objectifsDyn.pea} icon={TrendingUp} formatMoney={formatMoney} />
      </div>
    </div>
  );
};
