import { X, Keyboard } from "lucide-react";
import { KEYBOARD_SHORTCUTS } from "../../constants";

export const KeyboardHelp = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose} style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="card rounded-xl w-full max-w-sm animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="text-base font-semibold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <Keyboard className="w-5 h-5" />
            Raccourcis clavier
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-1">
          {KEYBOARD_SHORTCUTS.filter(s => s.key !== "Escape").map((shortcut, i) => (
            <div key={i} className="flex justify-between items-center py-2.5 last:border-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{shortcut.description}</span>
              <kbd className="kbd">{shortcut.key === "ArrowLeft" ? "←" : shortcut.key === "ArrowRight" ? "→" : shortcut.key.toUpperCase()}</kbd>
            </div>
          ))}
        </div>
        <div className="px-5 pb-4">
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Appuyez sur <kbd className="kbd">?</kbd> à tout moment pour afficher cette aide</p>
        </div>
      </div>
    </div>
  );
};
