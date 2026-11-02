import React from 'react';
import { ActionButton } from '@3gaspo/app-ui/ActionButton';
import { Dialog, DialogActions } from './Dialog';

interface ResetModalProps {
  onClose: () => void;
  onClearHistory: () => Promise<void>;
  onResetAll: () => Promise<void>;
}

export default function ResetModal({ onClose, onClearHistory, onResetAll }: ResetModalProps) {
  return (
    <Dialog open onClose={onClose} title="Reset data">
      <p className="ui-meta text-ui-muted text-sm">This action is permanent.</p>
        <DialogActions>
           <ActionButton scope="next-reset" busyLabel="Resetting…"
            onClick={async () => { await onClearHistory(); onClose(); }}
            className="ui-button ui-button-secondary w-full h-14 bg-ui-section rounded-2xl font-bold hover:bg-ui-ink/10 transition-all"
          >
            Clear History
          </ActionButton>
          <ActionButton scope="next-reset" busyLabel="Resetting…"
            onClick={async () => { await onResetAll(); onClose(); }}
            className="w-full h-14 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all"
          >
            Reset All
          </ActionButton>
          <ActionButton scope="next-reset"
            onClick={onClose}
            className="w-full h-14 bg-transparent text-ui-ink/40 font-bold hover:text-ui-ink/60 transition-all"
          >
            Cancel
          </ActionButton>
        </DialogActions>
    </Dialog>
  );
}
