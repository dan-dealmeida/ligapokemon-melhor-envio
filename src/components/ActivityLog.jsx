import { RefreshCw } from 'lucide-react';

export function ActivityLog({ logMessages, isProcessing, onClearLogs }) {
  if (logMessages.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <RefreshCw className={`w-4 h-4 text-amber-400 ${isProcessing ? 'animate-spin' : ''}`} />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Log de Processamento
          </h3>
        </div>
        <button
          onClick={onClearLogs}
          className="text-[11px] text-slate-400 hover:text-slate-200 transition"
        >
          Limpar
        </button>
      </div>
      <div className="mt-3 font-mono text-xs text-slate-300 space-y-1.5 max-h-48 overflow-y-auto pr-2">
        {logMessages.map((msg, i) => (
          <div key={i} className="leading-relaxed">
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}
