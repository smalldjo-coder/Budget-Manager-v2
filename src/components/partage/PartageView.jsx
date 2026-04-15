import { useState, useMemo, useCallback } from 'react';
import { Users, Trash2 } from 'lucide-react';
import { useBudgetStore } from '../../store';
import { filterExpensesByMonth } from '../../utils/partageCalculations';
import { MONTHS } from '../../constants';
import { PartageBalanceCard } from './PartageBalanceCard';
import { PartageForm } from './PartageForm';
import { PartageExpenseList } from './PartageExpenseList';
import { PartageChart } from './PartageChart';

export const PartageView = () => {
  const currentMonth = useBudgetStore(s => s.currentMonth);
  const partageExpenses = useBudgetStore(s => s.partageExpenses);
  const addPartageExpense = useBudgetStore(s => s.addPartageExpense);
  const removePartageExpense = useBudgetStore(s => s.removePartageExpense);
  const updatePartageExpense = useBudgetStore(s => s.updatePartageExpense);
  const clearPartageExpenses = useBudgetStore(s => s.clearPartageExpenses);
  const selectedYear = useBudgetStore(s => s.selectedYear);

  const [editingExpense, setEditingExpense] = useState(null);
  const [filterCat, setFilterCat] = useState(null);

  const monthExpenses = useMemo(
    () => filterExpensesByMonth(partageExpenses, currentMonth),
    [partageExpenses, currentMonth]
  );

  const handleSubmit = useCallback((expense) => {
    if (editingExpense) {
      updatePartageExpense(editingExpense.id, expense);
      setEditingExpense(null);
    } else {
      addPartageExpense(expense);
    }
  }, [editingExpense, addPartageExpense, updatePartageExpense]);

  const handleEdit = useCallback((expense) => {
    setEditingExpense(expense);
    // Scroll to top where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDelete = useCallback((id) => {
    removePartageExpense(id);
  }, [removePartageExpense]);

  const handleCancelEdit = useCallback(() => {
    setEditingExpense(null);
  }, []);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/15 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent-purple" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-heading leading-none">
              Partage des dépenses
            </h2>
            <span className="text-xs text-text-muted">
              {MONTHS[currentMonth]} {selectedYear} · Équilibre couple
            </span>
          </div>
        </div>

        {partageExpenses.length > 0 && (
          <button
            onClick={clearPartageExpenses}
            className="btn-danger text-xs"
            title="Réinitialiser toutes les dépenses partagées"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        )}
      </div>

      {/* Balance Card */}
      <PartageBalanceCard expenses={monthExpenses} />

      {/* Form */}
      <PartageForm
        key={editingExpense?.id || 'new'}
        onSubmit={handleSubmit}
        editingExpense={editingExpense}
        onCancelEdit={handleCancelEdit}
        currentMonth={currentMonth}
      />

      {/* Charts (only shown when there are expenses) */}
      <PartageChart expenses={monthExpenses} />

      {/* Expense List */}
      <PartageExpenseList
        expenses={monthExpenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        filterCat={filterCat}
        setFilterCat={setFilterCat}
      />
    </div>
  );
};
