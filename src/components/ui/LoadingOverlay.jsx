import { Loader2 } from "lucide-react";

export const LoadingOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="card rounded-2xl p-8 flex flex-col items-center gap-4 animate-scaleIn" style={{ boxShadow: 'var(--shadow-modal)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-blue)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Import en cours...</span>
      </div>
    </div>
  );
};
