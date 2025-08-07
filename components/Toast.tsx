
import React, { useEffect } from 'react';
import { ClipboardDocumentCheckIcon, XIcon } from './icons';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  t: (key: string, ...args: any[]) => string;
}

export const Toast: React.FC<ToastProps> = ({ message, show, onClose, t }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-zinc-200 text-zinc-900 rounded-lg shadow-lg p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-500 z-50 max-w-md">
      <ClipboardDocumentCheckIcon className="w-8 h-8 text-zinc-800 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold">{t('toastSuccessTitle')}</p>
        <p className="text-sm break-words">{message}</p>
      </div>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-300 transition-colors self-start">
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
