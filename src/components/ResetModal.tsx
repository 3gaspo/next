import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ResetModalProps {
  onClose: () => void;
  onClearHistory: () => void;
  onResetAll: () => void;
}

export default function ResetModal({ onClose, onClearHistory, onResetAll }: ResetModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />
      <motion.div
         initial={{ opacity: 0, scale: 0.9, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.9, y: 20 }}
         className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl flex flex-col gap-6"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center text-red-500">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Reset Data</h2>
          <p className="text-zinc-500 text-sm">This action is permanent. What would you like to clear?</p>
        </div>

        <div className="flex flex-col gap-3">
           <button 
            onClick={() => { onClearHistory(); onClose(); }}
            className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
          >
            Clear History
          </button>
          <button 
            onClick={() => { onResetAll(); onClose(); }}
            className="w-full h-14 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 active:scale-[0.98] transition-all"
          >
            Reset All
          </button>
          <button 
            onClick={onClose}
            className="w-full h-14 bg-transparent text-zinc-400 font-bold hover:text-zinc-600 transition-all"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
