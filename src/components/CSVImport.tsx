import { useCallback, useState } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';
import { useBudgetStore } from '../store/budgetStore';

export function CSVImport() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const { setRevenus, setBesoins, setDettes, setEpargne, setEnvies, addTransactions } = useBudgetStore();

  const handleFile = useCallback(async (file: File) => {
    try {
      const content = await file.text();
      const parsed = parseCSV(content);

      setRevenus(parsed.revenus);
      setBesoins(parsed.besoins);
      setDettes(parsed.dettes);
      setEpargne(parsed.epargne);
      setEnvies(parsed.envies);
      addTransactions(parsed.transactions);

      setStatus('success');
      setMessage(`${parsed.transactions.length} transactions importées`);
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setMessage('Erreur lors de l\'import du fichier');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [setRevenus, setBesoins, setDettes, setEpargne, setEnvies, addTransactions]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleFile(file);
    } else {
      setStatus('error');
      setMessage('Veuillez importer un fichier CSV');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-8 transition-all duration-200
        ${isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600 hover:border-dark-500'}
        ${status === 'success' ? 'border-green-500 bg-green-500/10' : ''}
        ${status === 'error' ? 'border-red-500 bg-red-500/10' : ''}
      `}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="flex flex-col items-center gap-3 text-center">
        {status === 'idle' && (
          <>
            <div className="p-3 rounded-full bg-dark-800">
              <Upload className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="font-medium text-dark-100">Importer un fichier CSV</p>
              <p className="text-sm text-dark-400 mt-1">
                Glissez-déposez ou cliquez pour sélectionner
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-dark-500">
              <FileText className="w-4 h-4" />
              <span>Format: Compte;Date de valeur;Montant (séparateur ;)</span>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="p-3 rounded-full bg-green-500/20">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <p className="font-medium text-green-400">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="p-3 rounded-full bg-red-500/20">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="font-medium text-red-400">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
