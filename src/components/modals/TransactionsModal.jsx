import { parse } from "date-fns";
import { ClipboardList } from "lucide-react";
import { Modal } from "../ui/Modal";
import { MONTHS } from "../../constants";
import { formatMoney } from "../../utils/formatters";
import { useBudgetStore } from "../../store";

export const TransactionsModal = () => {
  const showTransactions = useBudgetStore(s => s.showTransactions);
  const setShowTransactions = useBudgetStore(s => s.setShowTransactions);
  const transactions = useBudgetStore(s => s.transactions);

  return (
    <Modal isOpen={!!showTransactions} onClose={() => setShowTransactions(null)} title={`Transactions — ${showTransactions ? MONTHS[showTransactions.month] : ""}`} size="lg">
      {showTransactions && (
        <div>
          <div className="mb-3 text-sm text-gray-400">
            {showTransactions.section === "revenus" ? "Revenus" : showTransactions.category} {showTransactions.subcategory ? `> ${showTransactions.subcategory}` : ""}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Nom</th>
                  <th className="pb-2 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .filter(t => t.month === showTransactions.month &&
                    (showTransactions.section === "revenus"
                      ? t.section === "revenus" && t.category === showTransactions.category
                      : t.category === showTransactions.category && t.subcategory === showTransactions.subcategory))
                  .sort((a, b) => {
                    const da = parse(a.date, "dd/MM/yyyy", new Date());
                    const db = parse(b.date, "dd/MM/yyyy", new Date());
                    return db - da;
                  })
                  .map((t, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <td className="py-2 text-gray-300">{t.date}</td>
                      <td className="py-2 text-white truncate max-w-[200px]">{t.nom || "-"}</td>
                      <td className="py-2 text-right text-green-400">{formatMoney(t.montant)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {transactions.filter(t => t.month === showTransactions.month).length === 0 && (
              <div className="text-center py-8 animate-fadeIn">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">Aucune transaction importée</p>
                <p className="text-xs text-gray-600 mt-1">Utilisez le bouton iCompta pour importer vos transactions</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
