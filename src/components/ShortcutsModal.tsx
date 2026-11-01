import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Mezerník (Space)', desc: 'Spustit nebo pozastavit časovač (Start / Pause)' },
    { key: 'R', desc: 'Resetovat aktuální časovač' },
    { key: 'S', desc: 'Přeskočit do další fáze (Skip)' },
    { key: 'M', desc: 'Zapnout / Vypnout ambientní zvuk (Mute toggle)' },
    { key: 'F', desc: 'Přepnout Zen / Fullscreen režim' },
    { key: '?', desc: 'Otevřít tuto nápovědu klávesových zkratek' },
    { key: 'Esc', desc: 'Zavřít otevřené okno nebo opustit Zen režim' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card shortcuts-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Keyboard size={20} className="accent-icon" />
            <h2>Klávesové Zkratky</h2>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close shortcuts">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="shortcuts-list">
            {shortcuts.map((sc) => (
              <div key={sc.key} className="shortcut-item">
                <kbd className="shortcut-kbd">{sc.key}</kbd>
                <span className="shortcut-desc">{sc.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <span className="shortcut-tip">Tip: Klávesové zkratky jsou neaktivní při psaní do políčka úkolu.</span>
          <button className="btn-save-modal" onClick={onClose}>
            Rozumím
          </button>
        </div>
      </div>
    </div>
  );
};
