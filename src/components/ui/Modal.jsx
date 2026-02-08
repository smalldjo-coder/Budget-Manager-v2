import { X } from "lucide-react";

export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;
  const sizes = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose} style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}>
      <div className={`card rounded-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn`} onClick={e => e.stopPropagation()} style={{ boxShadow: 'var(--shadow-modal)' }}>
        <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="text-base font-semibold tracking-tight" style={{ color: 'var(--text-heading)' }}>{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
