import { useRef } from 'react';
import { UploadCloud, Sparkles, Trash2 } from 'lucide-react';

export function CsvUploader({ onContentLoaded, onLoadMock, hasOrders, onClearOrders }) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        onContentLoaded(content);
      }
    };
    reader.readAsText(file, 'ISO-8859-1');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-slate-900/70 border-2 border-dashed border-slate-700/80 hover:border-amber-500/60 transition-colors rounded-2xl p-6 sm:p-8 text-center relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition transform">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">
            Arraste o arquivo CSV da LigaPokemon aqui ou clique para selecionar
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Detecta automaticamente colunas separadas por ponto-e-vírgula (;) ou vírgula (,)
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 z-20">
          <button
            type="button"
            onClick={onLoadMock}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Carregar Pedidos de Teste (Mock TCG)</span>
          </button>

          {hasOrders && (
            <button
              type="button"
              onClick={onClearOrders}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 transition flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Lista</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
