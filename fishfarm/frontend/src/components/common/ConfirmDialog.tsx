import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="flex items-start gap-4 mb-6">
        {isDestructive && (
          <div className="bg-red-500/10 p-3 rounded-full shrink-0">
            <AlertTriangle className="text-red-500 w-6 h-6" />
          </div>
        )}
        <p className="text-slate-300 leading-relaxed mt-1">{message}</p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors border border-slate-700"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onCancel(); // Auto-close
          }}
          className={`px-4 py-2 font-medium rounded-lg transition-colors text-white ${
            isDestructive 
              ? 'bg-red-600 hover:bg-red-500 shadow-md shadow-red-900/20' 
              : 'bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-900/20'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
