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
    <div className="flex flex-col gap-4 relative pb-24">
      {/* Grid 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* COLONNE GAUCHE: Revenus, Dettes, Envies */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center justify-between uppercase tracking-wide text-accent-blue">
              <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> REVENUS</span>
              <span className="font-bold text-lg text-white">{formatMoney(calculs.totalRevenus)}</span>
            </h2>
            <div className="space-y-2">
              <InputRow label="Activité" icon={Briefcase} value={data.revenus.activite} onChange={v => updateRevenus("activite", v)} />
              <InputRow label="Sociaux" icon={Users} value={data.revenus.sociaux} onChange={v => updateRevenus("sociaux", v)} />
              <InputRow label="Intérêts" icon={Coins} value={data.revenus.interets} onChange={v => updateRevenus("interets", v)} />
              <InputRow label="Flux internes" icon={ArrowRightLeft} value={data.revenus.fluxInternes} onChange={v => updateRevenus("fluxInternes", v)} className="text-text-muted" />
            </div>
            <div className="mt-4 pt-3 flex justify-between font-semibold text-sm border-t border-border-subtle items-center">
              <span className="text-text-secondary">OBJECTIF MENSUEL</span>
              <span className="text-accent-blue">100%</span>
            </div>
            <div className="mt-2 h-1.5 bg-surface-300 rounded-full overflow-hidden">
              <div className="h-full bg-accent-blue w-full rounded-full"></div>
            </div>
            <div className="mt-4 pt-3 flex justify-between font-medium text-xs border-t border-border-subtle text-text-secondary">
              <span>→ SOLDE</span>
              <span className="text-white font-bold">{formatMoney(calculs.totalRevenus)}</span>
            </div>
          </div>

          <div className="card p-5 border-l-2 border-l-accent-blue">
            <h2 className="text-sm font-semibold mb-4 flex items-center justify-between uppercase tracking-wide text-accent-blue">
              <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> DETTES</span>
              <span className="font-bold text-lg text-white">{formatMoney(calculs.totalDettes)}</span>
            </h2>
            <div className="space-y-2">
              <InputRow label="Crédit immo" icon={Home} value={data.sorties.dettes.creditImmo} onChange={v => updateSorties("dettes", "creditImmo", v)} />
              <InputRow label="Crédit auto" icon={Car} value={data.sorties.dettes.creditAuto} onChange={v => updateSorties("dettes", "creditAuto", v)} />
              <InputRow label="Autres" icon={CreditCard} value={data.sorties.dettes.autres} onChange={v => updateSorties("dettes", "autres", v)} />
            </div>
            <div className="mt-4 pt-3 flex justify-between text-xs border-t border-border-subtle text-text-muted">
              <span>SEUIL MAX (10%)</span><span className="tabular-nums">{formatMoney(calculs.seuilMaxDettes)}</span>
            </div>
            <ResultRow label="Total" value={calculs.totalDettes} pct={calculs.pctDettes} alert={calculs.alerteDettes} alertMessage=">10%" formatMoney={formatMoney} formatPct={formatPct} />
            <StatusIndicator label="Taux d'endettement" pct={calculs.pctDettes} zones={ZONES_CONFIG.dettes} />
            <div className="mt-4 pt-3 flex justify-between font-medium text-xs border-t border-border-subtle text-text-secondary">
              <span>→ SOLDE</span>
              <span className="text-white font-bold">{formatMoney(calculs.soldeApresDettes)}</span>
            </div>
          </div>

          <div className="card p-5 border-l-2 border-l-accent-rose">
            <h2 className="text-sm font-semibold mb-4 flex items-center justify-between uppercase tracking-wide text-accent-rose">
              <span className="flex items-center gap-2"><Gift className="w-4 h-4" /> ENVIES</span>
              <span className="font-bold text-lg text-white">{formatMoney(calculs.totalEnvies)}</span>
            </h2>
            <div className="space-y-2">
              <InputRow label="Fourmilles" value={data.sorties.envies.fourmilles} onChange={v => updateSorties("envies", "fourmilles", v)} />
              <InputRow label="Occasionnel" icon={Gift} value={data.sorties.envies.occasionnel} onChange={v => updateSorties("envies", "occasionnel", v)} />
            </div>
            <div className="mt-4 pt-3 flex justify-between text-xs border-t border-border-subtle text-text-muted">
              <span>OBJECTIF ({formatPct(1 - data.levier)})</span><span className="tabular-nums">{formatMoney(calculs.enviesObjectif)}</span>
            </div>
            <ResultRow label="Total" value={calculs.totalEnvies} pct={calculs.pctEnvies} alert={calculs.alerteEnviesMax} alertMessage=">30%" target="10-30%" formatMoney={formatMoney} formatPct={formatPct} />
            <StatusIndicator label="Santé Envies" pct={calculs.pctEnvies} zones={ZONES_CONFIG.envies} />
            <div className="mt-4 pt-3 flex justify-between font-medium text-xs border-t border-border-subtle text-text-secondary">
              <span>→ SOLDE</span>
              <span className="text-white font-bold">{formatMoney(calculs.soldeFinal)}</span>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE: Besoins, Epargne */}
        <div className="space-y-4">
          <div className="card p-5 border-l-2 border-l-surface-600">
            <h2 className="text-sm font-semibold mb-4 flex items-center justify-between uppercase tracking-wide text-text-secondary">
              <span className="flex items-center gap-2"><Home className="w-4 h-4" /> BESOINS</span>
              <span className="font-bold text-lg text-white">{formatMoney(calculs.totalBesoins)}</span>
            </h2>
            <div className="space-y-2">
              <InputRow label="Fixes" value={data.sorties.besoins.fixes} onChange={v => updateSorties("besoins", "fixes", v)} />
              <InputRow label="Variables" value={data.sorties.besoins.variables} onChange={v => updateSorties("besoins", "variables", v)} />
              <InputRow label="Nécessité" value={data.sorties.besoins.necessite} onChange={v => updateSorties("besoins", "necessite", v)} />
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle"></div>
            <StatusIndicator label="Santé Financière" pct={calculs.pctBesoins} zones={ZONES_CONFIG.besoins} />
            <div className="mt-4 pt-3 flex justify-between font-medium text-xs border-t border-border-subtle text-text-secondary">
              <span>→ SOLDE</span>
              <span className="text-white font-bold">{formatMoney(calculs.soldeApresBesoins)}</span>
            </div>
          </div>

          <div className="card p-5 border-l-2 border-l-accent-amber">
            <h2 className="text-sm font-semibold mb-4 flex items-center justify-between uppercase tracking-wide text-accent-amber">
              <span className="flex items-center gap-2"><PiggyBank className="w-4 h-4" /> ÉPARGNE</span>
              <span className="font-bold text-lg text-white">{formatMoney(calculs.totalEpargne)}</span>
            </h2>
            <div className="space-y-2">
              <InputRow label="Livrets" icon={Wallet} value={data.sorties.epargne.livret} onChange={v => updateSorties("epargne", "livret", v)} />
              <InputRow label="Placement PEA" icon={TrendingUp} value={data.sorties.epargne.placement} onChange={v => updateSorties("epargne", "placement", v)} />
              <InputRow label="Invest. Perso" icon={BookOpen} value={data.sorties.epargne.investPerso} onChange={v => updateSorties("epargne", "investPerso", v)} />
            </div>
            <div className="mt-4 pt-3 flex justify-between text-xs border-t border-border-subtle text-text-muted">
              <span>OBJECTIF ({formatPct(data.levier)})</span><span className="tabular-nums">{formatMoney(calculs.epargneObjectif)}</span>
            </div>
            <ResultRow label="Total" value={calculs.totalEpargne} pct={calculs.pctEpargne} alert={calculs.alerteEpargneMin || calculs.alerteEpargneMax} alertMessage={calculs.alerteEpargneMin ? "<5%" : ">20%"} target="5-20%" formatMoney={formatMoney} formatPct={formatPct} />
            <StatusIndicator label="Effort d'épargne" pct={calculs.pctEpargne} zones={ZONES_CONFIG.epargne} />
            <div className="mt-4 pt-3 flex justify-between font-medium text-xs border-t border-border-subtle text-text-secondary">
              <span>→ SOLDE</span>
              <span className="text-white font-bold">{formatMoney(calculs.soldeApresEpargne)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* LEVIER - Full Width */}
      <div className="card p-6 border border-accent-purple/30 bg-gradient-to-br from-surface-150 to-surface-100 mt-2 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-purple to-accent-rose"></div>
        <h2 className="text-sm font-semibold mb-5 flex items-center justify-center gap-2 uppercase tracking-wide text-accent-purple">
          <Scale className="w-5 h-5" /> LEVIER
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between text-xs mb-3 text-text-secondary font-medium">
            <span className="flex items-center gap-1.5"><PiggyBank className="w-4 h-4 text-accent-amber" /> {formatPct(data.levier)} Épargne</span>
            <span className="flex items-center gap-1.5">{formatPct(1 - data.levier)} Envies <Gift className="w-4 h-4 text-accent-rose" /></span>
          </div>
          
          <div className="relative py-2">
            <input 
              type="range" min="0" max="1" step="0.001" 
              value={data.levier} onChange={e => updateLevier(e.target.value)} 
              className="w-full h-2 bg-surface-400 rounded-full appearance-none cursor-pointer relative z-10" 
            />
          </div>

          {calculs.soldeApresDettes > 0 && calculs.ca > 0 && (
            <div className="mt-6 pt-5 border-t border-border-subtle">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-accent-amber text-xs font-semibold">ÉPARGNE</span>
                    <span className="text-white text-sm font-bold">{formatMoney(calculs.epargneObjectif)}</span>
                  </div>
                  <div className="h-1.5 bg-surface-400 rounded-full overflow-hidden flex">
                    <div className="bg-accent-emerald h-full" style={{ width: Math.min(calculs.pctEpargneObjectif, 100) + '%' }}></div>
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-text-muted">
                    <span>0%</span>
                    <span className={calculs.pctEpargneObjectif >= 5 && calculs.pctEpargneObjectif <= 20 ? "text-accent-emerald" : "text-accent-rose"}>{calculs.pctEpargneObjectif.toFixed(1)}%</span>
                    <span>50%</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-accent-rose text-xs font-semibold">ENVIES</span>
                    <span className="text-white text-sm font-bold">{formatMoney(calculs.enviesObjectif)}</span>
                  </div>
                  <div className="h-1.5 bg-surface-400 rounded-full overflow-hidden flex">
                    <div className="bg-accent-rose h-full" style={{ width: Math.min(calculs.pctEnviesObjectif, 100) + '%' }}></div>
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-text-muted">
                    <span>0%</span>
                    <span className={calculs.pctEnviesObjectif >= 10 && calculs.pctEnviesObjectif <= 30 ? "text-accent-emerald" : "text-accent-rose"}>{calculs.pctEnviesObjectif.toFixed(1)}%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <div className={"px-4 py-1.5 rounded-full text-xs flex items-center gap-2 font-medium border " + (
                  calculs.pctEpargneObjectif >= 5 && calculs.pctEpargneObjectif <= 20 &&
                  calculs.pctEnviesObjectif >= 10 && calculs.pctEnviesObjectif <= 30
                    ? "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20" : "bg-accent-amber/10 text-accent-amber border-accent-amber/20"
                )}>
                  {calculs.pctEpargneObjectif >= 5 && calculs.pctEpargneObjectif <= 20 &&
                   calculs.pctEnviesObjectif >= 10 && calculs.pctEnviesObjectif <= 30
                    ? <><Check className="w-3.5 h-3.5" /> Répartition équilibrée</>
                    : <><AlertTriangle className="w-3.5 h-3.5" /> Ajustez le levier</>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING SOLDE FINAL */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-2xl">
        <div className="glass shadow-modal rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-border-strong relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-emerald to-accent-blue"></div>
          <div>
            <div className="flex items-center gap-2 text-text-primary text-xs font-bold uppercase tracking-wider mb-1">
              <Wallet className="w-4 h-4" /> SOLDE FINAL
            </div>
            <div className={"text-3xl font-black tracking-tight tabular-nums " + (calculs.soldeFinal >= 0 ? "text-accent-emerald" : "text-accent-rose")}>
              {formatMoney(calculs.soldeFinal)}
            </div>
            <div className="text-xs flex items-center gap-1.5 mt-1 text-text-secondary font-medium">
              {calculs.soldeFinal >= 0 ? <><Check className="w-3.5 h-3.5 text-accent-emerald" /> Budget équilibré</> : <><AlertTriangle className="w-3.5 h-3.5 text-accent-rose" /> Déficit budgétaire</>}
            </div>
          </div>
          <button className="btn-primary py-3 px-6 rounded-xl font-bold text-sm shadow-glow-blue w-full sm:w-auto">
            VALIDER LE MOIS
          </button>
        </div>
      </div>
  );
};
