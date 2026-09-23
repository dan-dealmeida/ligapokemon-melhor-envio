import { Truck, Key, Layers } from 'lucide-react';

export function SenderSettings({
  sender,
  setSender,
  apiToken,
  setApiToken,
  environment,
  setEnvironment,
  packageSettings,
  setPackageSettings,
  onSaveToast,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Col: Remetente Loja */}
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <span>Dados do Remetente (Sua Loja de Pokémon TCG)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Estes dados serão utilizados como origem no cálculo de frete e nas etiquetas do Melhor
            Envio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Nome Fantasia / Loja *</label>
            <input
              type="text"
              value={sender.name}
              onChange={(e) => setSender({ ...sender, name: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Razão Social / Nome Completo
            </label>
            <input
              type="text"
              value={sender.company}
              onChange={(e) => setSender({ ...sender, company: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              CPF ou CNPJ do Remetente *
            </label>
            <input
              type="text"
              value={sender.document}
              onChange={(e) => setSender({ ...sender, document: e.target.value })}
              placeholder="00.000.000/0000-00"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Telefone com DDD *</label>
            <input
              type="text"
              value={sender.phone}
              onChange={(e) => setSender({ ...sender, phone: e.target.value })}
              placeholder="11999999999"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-medium mb-1">E-mail de Contato *</label>
            <input
              type="email"
              value={sender.email}
              onChange={(e) => setSender({ ...sender, email: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">CEP de Origem *</label>
            <input
              type="text"
              value={sender.postal_code}
              onChange={(e) => setSender({ ...sender, postal_code: e.target.value })}
              placeholder="00000-000"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Rua / Logradouro *</label>
            <input
              type="text"
              value={sender.address}
              onChange={(e) => setSender({ ...sender, address: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Número *</label>
              <input
                type="text"
                value={sender.number}
                onChange={(e) => setSender({ ...sender, number: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Complemento</label>
              <input
                type="text"
                value={sender.complement}
                onChange={(e) => setSender({ ...sender, complement: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Bairro *</label>
              <input
                type="text"
                value={sender.district}
                onChange={(e) => setSender({ ...sender, district: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Cidade *</label>
              <input
                type="text"
                value={sender.city}
                onChange={(e) => setSender({ ...sender, city: e.target.value })}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">UF *</label>
              <input
                type="text"
                maxLength={2}
                value={sender.state_abbr}
                onChange={(e) =>
                  setSender({ ...sender, state_abbr: e.target.value.toUpperCase() })
                }
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 uppercase text-center font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-800/80">
          <span className="text-[11px] text-emerald-400/90 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Salvo automaticamente no navegador (localStorage) ao digitar</span>
          </span>
          <button
            type="button"
            onClick={() => {
              window.localStorage.setItem('poke_me_sender', JSON.stringify(sender));
              window.localStorage.setItem('poke_me_token', apiToken);
              window.localStorage.setItem('poke_me_env', environment);
              window.localStorage.setItem('poke_me_package', JSON.stringify(packageSettings));
              onSaveToast();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
          >
            Salvar Dados Agora
          </button>
        </div>
      </div>

      {/* Right Col: API Token & Envelope Dimensions */}
      <div className="space-y-6">
        {/* API Token Setup */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Chave de API (Melhor Envio)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Ambiente</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEnvironment('sandbox')}
                  className={`py-2 rounded-xl font-semibold border transition ${
                    environment === 'sandbox'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Sandbox (Testes)
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironment('production')}
                  className={`py-2 rounded-xl font-semibold border transition ${
                    environment === 'production'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Produção (Real)
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-medium">
                  Personal Access Token (Bearer)
                </label>
                {apiToken && apiToken.trim().length > 0 ? (
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    ✓ Token salvo no navegador
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Modo Simulação ativo</span>
                )}
              </div>
              <textarea
                rows={3}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Cole aqui seu token gerado no Melhor Envio (ou deixe vazio para modo simulação)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-slate-500">
                  Gerado em: Painel ME &gt; Integrações &gt; Gerar Token
                </p>
                <button
                  type="button"
                  onClick={() => {
                    window.localStorage.setItem('poke_me_token', apiToken);
                    window.localStorage.setItem('poke_me_env', environment);
                    onSaveToast();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold text-[11px] transition"
                >
                  Salvar API
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Package Dimensions Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Cubagem Padrão (Singles / Cartas)</h3>
              <p className="text-[11px] text-slate-400">
                Valores mínimos aceitos pelas transportadoras
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Altura (cm)</label>
              <input
                type="number"
                step="0.5"
                value={packageSettings.height}
                onChange={(e) =>
                  setPackageSettings({ ...packageSettings, height: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono text-center"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Largura (cm)</label>
              <input
                type="number"
                value={packageSettings.width}
                onChange={(e) =>
                  setPackageSettings({ ...packageSettings, width: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono text-center"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Comprimento (cm)</label>
              <input
                type="number"
                value={packageSettings.length}
                onChange={(e) =>
                  setPackageSettings({ ...packageSettings, length: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono text-center"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.05"
                value={packageSettings.weight}
                onChange={(e) =>
                  setPackageSettings({ ...packageSettings, weight: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono text-center"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400 leading-relaxed">
            💡 <strong>Por que usar 16x11x2cm?</strong> Correios e Jadlog cobram erro de cubagem
            caso o pacote tenha menos que 15cm ou menos que 100g, mesmo em envelopes finos com
            cartas Pokémon avulsas.
          </div>
        </div>
      </div>
    </div>
  );
}
