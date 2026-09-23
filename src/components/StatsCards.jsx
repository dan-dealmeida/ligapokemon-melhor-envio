import { FileText, CheckCircle2, Truck, AlertTriangle } from 'lucide-react';

export function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium">Total de Pedidos</p>
          <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium">Dados Válidos</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{stats.valid}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-900/40">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium">No Carrinho ME</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{stats.sent}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-950/50 text-amber-400 border border-amber-900/40">
          <Truck className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium">Avisos / Pendências</p>
          <p className="text-xl font-bold text-rose-400 mt-1">{stats.errors}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-rose-950/50 text-rose-400 border border-rose-900/40">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
