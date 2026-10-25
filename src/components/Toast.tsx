import React from 'react';
import { CheckCircle2, Copy, AlertCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'copy';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          {toast.type === 'copy' && <Copy className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'info' && <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />}
          <span className="flex-1 truncate">{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
