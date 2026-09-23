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
    <div className="bg-zinc-900/80 border-2 border-dashed border-red-900/60 hover:border-red-500/80 transition-all rounded-2xl p-6 sm:p-8 text-center relative group overflow-hidden shadow-xl shadow-black/40">
      {/* Giant Background Team Rocket "R" Watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute -right-4 -bottom-10 text-[160px] font-black leading-none text-red-600/[0.06] group-hover:text-red-600/[0.11] transition-colors font-sans"
      >
        R
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="relative flex flex-col items-center justify-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-red-600/15 border border-red-500/40 text-red-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-red-600/25 transition transform shadow-lg shadow-red-950/50">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div>
          <p className="text-base font-bold text-white">
            Arraste o arquivo CSV da LigaPokemon para o QG Rocket ou clique para selecionar
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Rastreamento automático de colunas (; ou ,) • Mini Envios, PAC, SEDEX e Jadlog
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 z-20">
          <button
            type="button"
            onClick={onLoadMock}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-red-300 border border-red-500/40 transition flex items-center space-x-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Recrutar Pedidos de Teste (Mock Equipe Rocket)</span>
          </button>

          {hasOrders && (
            <button
              type="button"
              onClick={onClearOrders}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ejetar Lista</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
