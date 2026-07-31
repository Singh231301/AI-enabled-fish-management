import React, { useState } from 'react';
import { Pond } from '../../types/pond.types';
import { pondApi } from '../../api/endpoints/pond.api';
import toast from 'react-hot-toast';
import { X, AlertTriangle } from 'lucide-react';

interface DeletePondConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  pond: Pond;
  onSuccess: () => void;
}

export const DeletePondConfirmation: React.FC<DeletePondConfirmationProps> = ({
  isOpen,
  onClose,
  pond,
  onSuccess
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== pond.name) return;
    
    setIsDeleting(true);
    try {
      const res = await pondApi.deletePond(pond.id);
      if (res.success) {
        toast.success("Pond deleted");
        onSuccess();
      } else {
        toast.error(res.message || "Failed to delete pond");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete pond");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Delete Pond?
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg text-red-200 text-sm mb-6 space-y-3">
            <p className="font-semibold text-red-400">⚠️ You are about to delete '{pond.name}'.</p>
            <p>This will:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Hide the pond from your dashboard</li>
              <li>Preserve all existing data (feeding logs, finances, fish records)</li>
              <li>This action cannot be undone from the app</li>
            </ul>
          </div>

          <label className="block text-sm font-medium text-slate-300 mb-2">
            Type <span className="font-bold text-white select-none">'{pond.name}'</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Type '${pond.name}' to confirm`}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors mb-6"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-3 px-4 bg-transparent border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== pond.name || isDeleting}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2
                ${confirmText === pond.name 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20' 
                  : 'bg-red-900/50 text-red-400/50 cursor-not-allowed'}`}
            >
              {isDeleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                "Delete Pond"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
