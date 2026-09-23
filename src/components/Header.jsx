import { Package, Settings, ExternalLink, Flame } from 'lucide-react';

export function Header({ activeTab, setActiveTab, ordersCount }) {
  return (
    <header className="border-b border-red-950/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 shadow-lg shadow-red-950/20">
      {/* Top Crimson Team Rocket Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-red-800 via-red-500 to-red-800" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl blur opacity-40 group-hover:opacity-75 transition" />
            <img
              src="/favicon.svg?v=rocket"
              alt="Team Rocket Emblem"
              className="relative w-10 h-10 rounded-xl border border-red-500/40 shadow-lg"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-red-400 bg-clip-text text-transparent">
                EQUIPE ROCKET ➔ MELHOR ENVIO
              </h1>
              <span className="text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/40 flex items-center space-x-1">
                <Flame className="w-3 h-3 text-red-500" />
                <span>QG Logística TCG</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block italic">
              &ldquo;Prepare-se para a encrenca! Encrenca em dobro!&rdquo; • Despacho de cartas na velocidade da luz
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30 border border-red-400/30'
                : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Carregamentos ({ordersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('sender')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'sender'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30 border border-red-400/30'
                : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Base & API</span>
          </button>

          <a
            href="https://melhorenvio.com.br/painel/carrinho"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-red-400 border border-red-500/40 hover:bg-red-950/50 hover:text-red-300 transition flex items-center space-x-1.5"
          >
            <span>Carrinho ME</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
