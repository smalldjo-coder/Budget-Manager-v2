import { Download } from 'lucide-react';
import { useBudgetStore } from '../store/budgetStore';
import { exportToCSV } from '../utils/csvParser';

export function ExportButton() {
  const { revenus, besoins, dettes, epargne, envies } = useBudgetStore();

  const handleExport = () => {
    const csvContent = exportToCSV({ revenus, besoins, dettes, epargne, envies });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
    >
      <Download className="w-4 h-4" />
      <span>Exporter CSV</span>
    </button>
  );
}
