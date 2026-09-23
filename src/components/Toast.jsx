import { CheckCircle2, XCircle, Info } from 'lucide-react';

export function Toast({ activeToast }) {
  if (!activeToast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce transition-all">
      <div
        className={`flex items-center space-x-2 px-4 py-3 rounded-xl shadow-2xl border text-sm ${
          activeToast.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-900/30'
            : activeToast.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-900/30'
            : 'bg-slate-900/90 text-slate-200 border-slate-700 shadow-slate-950/50'
        }`}
      >
        {activeToast.type === 'success' && (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        )}
        {activeToast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {activeToast.type === 'info' && <Info className="w-5 h-5 text-amber-400 shrink-0" />}
        <span>{activeToast.message}</span>
      </div>
    </div>
  );
}
