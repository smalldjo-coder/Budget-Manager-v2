import { useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import {
  BarChart3, TrendingUp, PiggyBank, Gift, CreditCard, Target,
  Calendar, Wallet, ClipboardList, ArrowLeftRight, Check
} from "lucide-react";
import { MONTHS } from "../../constants";
import { ZONES_CONFIG } from "../../constants/zones";
import { formatMoney, formatPct } from "../../utils/formatters";
import { computeMonthCalculs, computeAllMonthsCalculs, computeAnnualStats, computeEpargnesCumulees, computeDonutData } from "../../utils/calculations";
import { Gauge } from "../ui/Gauge";
import { ProgressBar } from "../ui/ProgressBar";
import { StatusIndicator } from "../ui/StatusIndicator";
import { useBudgetStore } from "../../store";

export const DashboardView = () => {
  const currentMonth = useBudgetStore(s => s.currentMonth);
  const setCurrentMonth = useBudgetStore(s => s.setCurrentMonth);
  const monthsData = useBudgetStore(s => s.monthsData);
  const selectedYear = useBudgetStore(s => s.selectedYear);
  const objectifs = useBudgetStore(s => s.objectifs);
  const budgetPrevu = useBudgetStore(s => s.budgetPrevu);
  const setShowBudgetPrevu = useBudgetStore(s => s.setShowBudgetPrevu);
  const setShowCompare = useBudgetStore(s => s.setShowCompare);
  const updatePatrimoine = useBudgetStore(s => s.updatePatrimoine);

  const data = monthsData[currentMonth];
  const calculs = useMemo(() => computeMonthCalculs(data, objectifs), [data, objectifs]);
  const allMonthsCalculs = useMemo(() => computeAllMonthsCalculs(monthsData), [monthsData]);
  const annualStats = useMemo(() => computeAnnualStats(allMonthsCalculs, budgetPrevu), [allMonthsCalculs, budgetPrevu]);
  const epargnesCumulees = useMemo(() => computeEpargnesCumulees(allMonthsCalculs), [allMonthsCalculs]);
  const donutData = useMemo(() => computeDonutData(calculs), [calculs]);

  const HealthCalendar = useCallback(() => {
    const colorStyles = {
      empty: { backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' },
      good: { backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399' },
      ok: { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
      bad: { backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }
    };
    return (
      <div className="grid grid-cols-6 gap-1.5">
        {allMonthsCalculs.map((m, idx) => {
          const health = m.ca === 0 ? "empty" : m.soldeFinal >= 0 ? (m.soldeFinal > m.ca * 0.1 ? "good" : "ok") : "bad";
          return (
            <button key={idx} onClick={() => setCurrentMonth(idx)}
              className={"rounded-lg p-1.5 text-xs font-medium transition-all " + (currentMonth === idx ? "ring-2 ring-blue-400/50" : "")}
              style={colorStyles[health]}>
              {m.mois}
            </button>
          );
        })}
      </div>
    );
  }, [allMonthsCalculs, currentMonth, setCurrentMonth]);

  return (
    <div className="space-y-4">
      {/* Boutons Dashboard */}
      <div className="flex justify-end gap-2">
        <button onClick={() => setShowBudgetPrevu(true)} className="btn-primary">
          <ClipboardList className="w-4 h-4" />
          Budget Prévu
        </button>
        <button onClick={() => setShowCompare(true)} className="btn-accent-purple">
          <ArrowLeftRight className="w-4 h-4" />
          Comparer
        </button>
      </div>

      <div className="card p-5 card-hover">
        <h2 className="text-sm font-semibold mb-4 text-center flex items-center justify-center gap-2 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
          <BarChart3 className="w-4 h-4" />
          Indicateurs — {MONTHS[currentMonth]}
        </h2>

        {/* Score de santé budgétaire */}
        {calculs.ca > 0 && (
          <div className="mb-5 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--bg-input), var(--bg-card))', border: '1px solid var(--border-default)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Score de santé budgétaire</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold tabular-nums ${
                  calculs.healthScore >= 80 ? "text-green-400" :
                  calculs.healthScore >= 60 ? "text-yellow-400" :
                  calculs.healthScore >= 40 ? "text-orange-400" : "text-red-400"
                }`}>
                  {calculs.healthScore}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-selected)' }}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  calculs.healthScore >= 80 ? "bg-green-500" :
                  calculs.healthScore >= 60 ? "bg-yellow-500" :
                  calculs.healthScore >= 40 ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${calculs.healthScore}%` }}
              />
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>
              {calculs.healthScore >= 80 ? "Excellent ! Votre budget est équilibré" :
               calculs.healthScore >= 60 ? "Bon équilibre, quelques ajustements possibles" :
               calculs.healthScore >= 40 ? "À améliorer, revoyez vos priorités" :
               "Critique, action urgente nécessaire"}
            </p>
          </div>
        )}

        <div className="flex justify-around flex-wrap gap-4">
          <Gauge label="Dettes" value={calculs.pctDettes * 100} thresholdHigh={objectifs.seuilDettes} icon={CreditCard} color="#4f7df5" />
          <Gauge label="Épargne" value={calculs.pctEpargne * 100} thresholdLow={objectifs.epargneMin} thresholdHigh={objectifs.epargneMax} icon={PiggyBank} color="#f59e0b" />
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
        <div className="card p-5 card-hover animate-slideUp stagger-1">
          <h2 className="text-sm font-semibold mb-3 text-center flex items-center justify-center gap-2 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
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

        <div className="card p-5 card-hover animate-slideUp stagger-2">
          <h2 className="text-sm font-semibold mb-3 text-center flex items-center justify-center gap-2 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
            <TrendingUp className="w-4 h-4" />
            Évolution annuelle
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={epargnesCumulees}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" strokeOpacity={0.5} />
              <XAxis dataKey="mois" tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: 'Inter' }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: 'Inter' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }} formatter={v => formatMoney(v)} />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              <Line type="monotone" dataKey="ca" name="Revenus" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="soldeFinal" name="Solde" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="epargneCumulee" name="Épargne cumulée" stroke="#F97316" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-3 text-center flex items-center justify-center gap-2 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
          <BarChart3 className="w-4 h-4" />
          Répartition mensuelle
        </h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={allMonthsCalculs}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" strokeOpacity={0.5} />
            <XAxis dataKey="mois" tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: 'Inter' }} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: 'Inter' }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }} formatter={v => formatMoney(v)} />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            <Bar dataKey="besoins" name="Besoins" fill="#6B7280" stackId="a" />
            <Bar dataKey="dettes" name="Dettes" fill="#3B82F6" stackId="a" />
            <Bar dataKey="epargne" name="Épargne" fill="#F97316" stackId="a" />
            <Bar dataKey="envies" name="Envies" fill="#EF4444" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
            <Target className="w-4 h-4" />
            Objectifs Patrimoine
          </h2>
          <ProgressBar label="LEP (Fond urgence)" current={data.patrimoine.lep} target={objectifs.lep} icon={Wallet} formatMoney={formatMoney} />
          <ProgressBar label="Livret A (Précaution)" current={data.patrimoine.livretA || 0} target={objectifs.livretA || 3000} icon={Wallet} formatMoney={formatMoney} />
          <ProgressBar label="PEA (Long terme)" current={data.patrimoine.pea} target={objectifs.pea} icon={TrendingUp} formatMoney={formatMoney} />
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Saisie — {MONTHS[currentMonth]}</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500">LEP</label>
                <input type="number" defaultValue={data.patrimoine.lep || ""} onBlur={e => updatePatrimoine("lep", e.target.value)} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right text-white text-xs" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Livret A</label>
                <input type="number" defaultValue={data.patrimoine.livretA || ""} onBlur={e => updatePatrimoine("livretA", e.target.value)} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right text-white text-xs" />
              </div>
              <div>
                <label className="text-xs text-gray-500">PEA</label>
                <input type="number" defaultValue={data.patrimoine.pea || ""} onBlur={e => updatePatrimoine("pea", e.target.value)} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right text-white text-xs" />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
            <Calendar className="w-4 h-4" />
            Santé budgétaire
          </h2>
          <HealthCalendar />
          <div className="flex justify-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-600" />Excédent</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-600" />Serré</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-600" />Déficit</div>
          </div>
          <div className="mt-4 pt-3 grid grid-cols-2 gap-2 text-xs" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Total revenus:</div>
            <div className="text-right font-semibold tabular-nums" style={{ color: 'var(--accent-emerald)' }}>{formatMoney(allMonthsCalculs.reduce((s, m) => s + m.ca, 0))}</div>
            <div style={{ color: 'var(--text-muted)' }}>Total épargne:</div>
            <div className="text-right font-semibold tabular-nums" style={{ color: 'var(--accent-amber)' }}>{formatMoney(allMonthsCalculs.reduce((s, m) => s + m.epargne, 0))}</div>
            <div style={{ color: 'var(--text-muted)' }}>Solde annuel:</div>
            <div className={"text-right font-semibold " + (allMonthsCalculs.reduce((s, m) => s + m.soldeFinal, 0) >= 0 ? "text-blue-400" : "text-red-400")}>
              {formatMoney(allMonthsCalculs.reduce((s, m) => s + m.soldeFinal, 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Section Prévu vs Réalisé */}
      {annualStats.prevu.revenus > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4 text-center flex items-center justify-center gap-2 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" strokeOpacity={0.5} />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: 'Inter' }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: 'Inter' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }} formatter={v => formatMoney(v)} />
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
                <div key={i} className="card-inset p-3">
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
  );
};
