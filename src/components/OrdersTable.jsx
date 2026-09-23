import {
  Download,
  RefreshCw,
  Send,
  Check,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Trash2,
} from 'lucide-react';
import { SERVICES } from '../constants/shipping';
import { cleanCep, validateOrder } from '../utils/validators';

export function OrdersTable({
  orders,
  selectedOrderIds,
  onToggleSelectAll,
  onToggleSelectOrder,
  onApplyServiceToSelected,
  onUpdateOrderService,
  onUpdateOrderValue,
  onEditOrder,
  onRemoveOrder,
  onDownloadCSV,
  onPushToMelhorEnvio,
  isProcessing,
  processProgress,
}) {
  if (orders.length === 0) return null;

  return (
    <div className="bg-zinc-900/85 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
      {/* Bulk Actions Bar */}
      <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selectedOrderIds.size === orders.length && orders.length > 0}
              onChange={onToggleSelectAll}
              className="w-4 h-4 rounded border-zinc-700 accent-red-600 text-red-600 focus:ring-red-500 bg-zinc-800"
            />
            <span className="font-semibold text-zinc-200">
              Selecionar Todos ({selectedOrderIds.size}/{orders.length})
            </span>
          </label>

          <div className="h-4 w-px bg-zinc-700 hidden sm:block" />

          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-400">Aplicar serviço em lote:</span>
            <select
              onChange={(e) => {
                if (e.target.value) onApplyServiceToSelected(e.target.value);
              }}
              className="bg-zinc-800 border border-zinc-700 text-xs rounded-lg px-2 py-1 text-zinc-200 focus:outline-none focus:border-red-500"
            >
              <option value="">Escolher serviço...</option>
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={onDownloadCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition flex items-center space-x-1.5"
            title="Gera a planilha oficial do Melhor Envio pronta para importação em lote"
          >
            <Download className="w-4 h-4 text-red-400" />
            <span>Baixar Planilha ME</span>
          </button>

          <button
            onClick={onPushToMelhorEnvio}
            disabled={isProcessing || selectedOrderIds.size === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white transition shadow-lg shadow-red-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 border border-red-400/30"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Decolando ({processProgress}%)...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Despachar {selectedOrderIds.size} para o Carrinho ME</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress bar when running batch */}
      {isProcessing && (
        <div className="w-full bg-zinc-800 h-1.5">
          <div
            className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 h-1.5 transition-all duration-300"
            style={{ width: `${processProgress}%` }}
          />
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-semibold uppercase tracking-wider">
              <th className="p-3 w-10 text-center">Sel.</th>
              <th className="p-3">Pedido</th>
              <th className="p-3">Destinatário & Documento</th>
              <th className="p-3">Destino (Cidade/UF)</th>
              <th className="p-3">CEP</th>
              <th className="p-3">Serviço de Frete</th>
              <th className="p-3">Valor</th>
              <th className="p-3 text-center">Status / Validação</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {orders.map((order) => {
              const validation = validateOrder(order);
              const isSelected = selectedOrderIds.has(order.id);

              return (
                <tr
                  key={order.id}
                  className={`hover:bg-zinc-800/40 transition ${
                    isSelected ? 'bg-red-500/[0.04]' : ''
                  }`}
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectOrder(order.id)}
                      className="w-4 h-4 rounded border-zinc-700 accent-red-600 text-red-600 focus:ring-red-500 bg-zinc-800 cursor-pointer"
                    />
                  </td>

                  <td className="p-3 font-mono font-semibold text-zinc-200">{order.id}</td>

                  <td className="p-3">
                    <div className="font-medium text-zinc-100">{order.name}</div>
                    {order.email && (
                      <div
                        className="text-[11px] text-zinc-400 truncate max-w-[190px]"
                        title={order.email}
                      >
                        {order.email}
                      </div>
                    )}
                    <div className="text-[11px] text-zinc-400 flex items-center space-x-1 mt-0.5">
                      <span>Doc:</span>
                      <span
                        className={
                          order.document ? 'text-zinc-300' : 'text-rose-400 font-semibold'
                        }
                      >
                        {order.document || 'Não informado'}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="text-zinc-200">
                      {order.city || <span className="text-rose-400 font-medium">Sem cidade</span>}{' '}
                      - {order.state_abbr || '??'}
                    </div>
                    <div
                      className="text-[11px] text-zinc-400 truncate max-w-[200px]"
                      title={`${order.address}, ${order.number}${
                        order.complement ? ' - ' + order.complement : ''
                      }`}
                    >
                      {order.address}, {order.number}
                      {order.complement && (
                        <span className="text-red-400/90 ml-1 font-medium">
                          ({order.complement})
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 font-mono">
                    {cleanCep(order.postal_code).length === 8 ? (
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {order.postal_code}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 font-semibold">
                        {order.postal_code || 'Sem CEP'}
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <select
                      value={order.service_id}
                      onChange={(e) => onUpdateOrderService(order.id, Number(e.target.value))}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-200 focus:outline-none focus:border-red-500 text-xs"
                    >
                      {SERVICES.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center space-x-1 font-mono">
                      <span className="text-zinc-500 text-xs">R$</span>
                      <input
                        type="number"
                        step="0.50"
                        min="1"
                        value={order.value}
                        onChange={(e) =>
                          onUpdateOrderValue(order.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-100 text-xs font-mono focus:outline-none focus:border-red-500"
                        title="Clique para alterar o valor segurado deste pedido"
                      />
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    {order.status === 'sent' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                        <Check className="w-3 h-3 mr-1" />
                        No Carrinho ({order.cart_id ? order.cart_id.substring(0, 8) : 'OK'})
                      </span>
                    ) : order.status === 'error' ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80 cursor-help"
                        title={order.error_msg || 'Erro ao processar'}
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Erro
                      </span>
                    ) : validation.isValid ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-emerald-400 border border-emerald-900/40">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Válido
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60 cursor-help"
                        title={validation.issues.join(', ')}
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {validation.issues[0]}
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        type="button"
                        onClick={() => onEditOrder(order)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition"
                        title="Editar dados deste pedido"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveOrder(order.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
