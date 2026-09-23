import { FileText, CheckCircle2, Truck, AlertTriangle } from 'lucide-react';

export function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-zinc-900/80 border border-zinc-800 hover:border-red-500/40 transition rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-black/40">
        <div>
          <p className="text-xs text-zinc-400 font-medium">Total de Pedidos</p>
          <p className="text-xl font-extrabold text-white mt-1">{stats.total}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-red-950/60 text-red-400 border border-red-800/40">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 transition rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-black/40">
        <div>
          <p className="text-xs text-zinc-400 font-medium">Alvos Válidos</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{stats.valid}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-900/40">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800 hover:border-red-500/40 transition rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-black/40">
        <div>
          <p className="text-xs text-zinc-400 font-medium">No Carrinho ME</p>
          <p className="text-xl font-extrabold text-red-400 mt-1">{stats.sent}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-red-950/60 text-red-400 border border-red-800/50">
          <Truck className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-black/40">
        <div>
          <p className="text-xs text-zinc-400 font-medium">Alertas / Sabotagens</p>
          <p className="text-xl font-extrabold text-amber-400 mt-1">{stats.errors}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-950/50 text-amber-400 border border-amber-900/40">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
