import { RefreshCw } from 'lucide-react';

export function ActivityLog({ logMessages, isProcessing, onClearLogs }) {
  if (logMessages.length === 0) return null;

  return (
    <div className="bg-zinc-900/85 border border-zinc-800 rounded-2xl p-4 shadow-xl shadow-black/40">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <RefreshCw className={`w-4 h-4 text-red-500 ${isProcessing ? 'animate-spin' : ''}`} />
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Terminal de Transmissão • QG Rocket
          </h3>
        </div>
        <button
          onClick={onClearLogs}
          className="text-[11px] text-zinc-400 hover:text-zinc-200 transition"
        >
          Limpar
        </button>
      </div>
      <div className="mt-3 font-mono text-xs text-zinc-300 space-y-1.5 max-h-48 overflow-y-auto pr-2">
        {logMessages.map((msg, i) => (
          <div key={i} className="leading-relaxed">
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}
