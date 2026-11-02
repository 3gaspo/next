import React from 'react';
import { Dialog, DialogActions } from './Dialog';

interface ResetModalProps {
  onClose: () => void;
  onClearHistory: () => void;
  onResetAll: () => void;
}

export default function ResetModal({ onClose, onClearHistory, onResetAll }: ResetModalProps) {
  return (
    <Dialog open onClose={onClose} title="Reset data">
      <p className="ui-meta text-ui-muted text-sm">This action is permanent.</p>
        <DialogActions>
           <button 
            onClick={() => { onClearHistory(); onClose(); }}
            className="ui-button ui-button-secondary w-full h-14 bg-ui-section rounded-2xl font-bold hover:bg-ui-ink/10 transition-all"
          >
            Clear History
          </button>
          <button 
            onClick={() => { onResetAll(); onClose(); }}
            className="w-full h-14 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all"
          >
            Reset All
          </button>
          <button 
            onClick={onClose}
            className="w-full h-14 bg-transparent text-ui-ink/40 font-bold hover:text-ui-ink/60 transition-all"
          >
            Cancel
          </button>
        </DialogActions>
    </Dialog>
  );
}
