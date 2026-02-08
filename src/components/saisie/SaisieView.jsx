import { useMemo } from "react";
import {
  TrendingUp, Home, Car, Gift, PiggyBank, BookOpen,
  CreditCard, Briefcase, Users, Coins, ArrowRightLeft, Scale,
  Check, AlertTriangle, X, Wallet
} from "lucide-react";
import { MONTHS } from "../../constants";
import { ZONES_CONFIG } from "../../constants/zones";
import { formatMoney, formatPct } from "../../utils/formatters";
import { computeMonthCalculs } from "../../utils/calculations";
import { InputRow } from "../ui/InputRow";
import { ResultRow } from "../ui/ResultRow";
import { StatusIndicator } from "../ui/StatusIndicator";
import { useBudgetStore } from "../../store";

export const SaisieView = () => {
  const currentMonth = useBudgetStore(s => s.currentMonth);
  const monthsData = useBudgetStore(s => s.monthsData);
  const objectifs = useBudgetStore(s => s.objectifs);
  const updateRevenus = useBudgetStore(s => s.updateRevenus);
  const updateSorties = useBudgetStore(s => s.updateSorties);
  const updateLevier = useBudgetStore(s => s.updateLevier);

  const data = monthsData[currentMonth];
  const calculs = useMemo(() => computeMonthCalculs(data, objectifs), [data, objectifs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="space-y-3">
        <div className="card p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 uppercase tracking-wide" style={{ color: 'var(--accent-emerald)' }}>
            <TrendingUp className="w-4 h-4" />
            1. REVENUS
          </h2>
          <div className="space-y-1">
            <InputRow label="Revenus activité" icon={Briefcase} value={data.revenus.activite} onChange={v => updateRevenus("activite", v)} />
            <InputRow label="Revenus sociaux" icon={Users} value={data.revenus.sociaux} onChange={v => updateRevenus("sociaux", v)} />
            <InputRow label="Intérêts / Avantages" icon={Coins} value={data.revenus.interets} onChange={v => updateRevenus("interets", v)} />
            <InputRow label="Flux internes" icon={ArrowRightLeft} value={data.revenus.fluxInternes} onChange={v => updateRevenus("fluxInternes", v)} className="text-gray-400" />
          </div>
          <div className="mt-3 pt-3 flex justify-between font-semibold text-sm" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--accent-emerald)' }}>
            <span>CA</span><span>{formatMoney(calculs.ca)}</span>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
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

        <div className="card p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 uppercase tracking-wide" style={{ color: 'var(--accent-blue)' }}>
            <CreditCard className="w-4 h-4" />
            3. DETTES
          </h2>
          <div className="space-y-1">
            <InputRow label="Crédit immobilier" icon={Home} value={data.sorties.dettes.creditImmo} onChange={v => updateSorties("dettes", "creditImmo", v)} />
            <InputRow label="Crédit auto" icon={Car} value={data.sorties.dettes.creditAuto} onChange={v => updateSorties("dettes", "creditAuto", v)} />
            <InputRow label="Autres (impôts...)" icon={CreditCard} value={data.sorties.dettes.autres} onChange={v => updateSorties("dettes", "autres", v)} />
          </div>
          <div className="mt-2 pt-2 text-xs flex justify-between" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            <span>Seuil MAX (10%)</span><span className="tabular-nums">{formatMoney(calculs.seuilMaxDettes)}</span>
          </div>
          <ResultRow label="Total" value={calculs.totalDettes} pct={calculs.pctDettes} alert={calculs.alerteDettes} alertMessage=">10%" formatMoney={formatMoney} formatPct={formatPct} />
          <StatusIndicator label="Santé Dettes" pct={calculs.pctDettes} zones={ZONES_CONFIG.dettes} />
          <ResultRow label="→ Solde" value={calculs.soldeApresDettes} highlight formatMoney={formatMoney} formatPct={formatPct} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="card p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 uppercase tracking-wide" style={{ color: 'var(--accent-amber)' }}>
            <PiggyBank className="w-4 h-4" />
            4. ÉPARGNE
          </h2>
          <div className="space-y-1">
            <InputRow label="Livret (LEP)" icon={Wallet} value={data.sorties.epargne.livret} onChange={v => updateSorties("epargne", "livret", v)} />
            <InputRow label="Placement (PEA)" icon={TrendingUp} value={data.sorties.epargne.placement} onChange={v => updateSorties("epargne", "placement", v)} />
            <InputRow label="Invest. personnel" icon={BookOpen} value={data.sorties.epargne.investPerso} onChange={v => updateSorties("epargne", "investPerso", v)} />
          </div>
          <div className="mt-2 pt-2 text-xs flex justify-between" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            <span>Objectif ({formatPct(data.levier)})</span><span className="tabular-nums">{formatMoney(calculs.epargneObjectif)}</span>
          </div>
          <ResultRow label="Total" value={calculs.totalEpargne} pct={calculs.pctEpargne} alert={calculs.alerteEpargneMin || calculs.alerteEpargneMax} alertMessage={calculs.alerteEpargneMin ? "<5%" : ">20%"} target="5-20%" formatMoney={formatMoney} formatPct={formatPct} />
          <StatusIndicator label="Santé Épargne" pct={calculs.pctEpargne} zones={ZONES_CONFIG.epargne} />
          <ResultRow label="→ Solde" value={calculs.soldeApresEpargne} highlight formatMoney={formatMoney} formatPct={formatPct} />
        </div>

        <div className="card p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 uppercase tracking-wide" style={{ color: 'var(--accent-rose)' }}>
            <Gift className="w-4 h-4" />
            5. ENVIES
          </h2>
          <div className="space-y-1">
            <InputRow label="Fourmilles" value={data.sorties.envies.fourmilles} onChange={v => updateSorties("envies", "fourmilles", v)} />
            <InputRow label="Occasionnel" icon={Gift} value={data.sorties.envies.occasionnel} onChange={v => updateSorties("envies", "occasionnel", v)} />
          </div>
          <div className="mt-2 pt-2 text-xs flex justify-between" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            <span>Objectif ({formatPct(1 - data.levier)})</span><span className="tabular-nums">{formatMoney(calculs.enviesObjectif)}</span>
          </div>
          <ResultRow label="Total" value={calculs.totalEnvies} pct={calculs.pctEnvies} alert={calculs.alerteEnviesMax} alertMessage=">30%" target="10-30%" formatMoney={formatMoney} formatPct={formatPct} />
          <StatusIndicator label="Santé Envies" pct={calculs.pctEnvies} zones={ZONES_CONFIG.envies} />
        </div>

        <div className="card p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 uppercase tracking-wide" style={{ color: 'var(--accent-purple)' }}>
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
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="grid grid-cols-2 gap-3">
                <div className="card-inset p-3">
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
                <div className="card-inset p-3">
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

        <div className="rounded-xl p-4 border" style={calculs.soldeFinal >= 0 ? { backgroundColor: 'rgba(52, 211, 153, 0.08)', borderColor: 'rgba(52, 211, 153, 0.2)' } : { backgroundColor: 'rgba(244, 63, 94, 0.08)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wide" style={{ color: 'var(--text-heading)' }}>
              <Wallet className="w-5 h-5" />
              SOLDE FINAL
            </span>
            <span className={"text-xl font-bold tabular-nums " + (calculs.soldeFinal >= 0 ? "text-green-400" : "text-red-400")}>
              {formatMoney(calculs.soldeFinal)}
            </span>
          </div>
          <div className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
            {calculs.soldeFinal >= 0 ? <><Check className="w-3 h-3" /> Budget équilibré</> : <><X className="w-3 h-3" /> Dépassement</>}
          </div>
        </div>
      </div>
    </div>
  );
};
