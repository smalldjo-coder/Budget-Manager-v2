import { ArrowLeftRight } from "lucide-react";
import { Modal } from "../ui/Modal";
import { MONTHS } from "../../constants";
import { formatMoney } from "../../utils/formatters";
import { useBudgetStore } from "../../store";

export const CompareModal = () => {
  const showCompare = useBudgetStore(s => s.showCompare);
  const setShowCompare = useBudgetStore(s => s.setShowCompare);
  const compareMonths = useBudgetStore(s => s.compareMonths);
  const setCompareMonths = useBudgetStore(s => s.setCompareMonths);
  const monthsData = useBudgetStore(s => s.monthsData);

  return (
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
                  <tr className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>
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
                      <tr key={i} className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
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
  );
};
