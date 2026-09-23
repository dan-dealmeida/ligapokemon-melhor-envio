import { useState, useMemo } from 'react';
import { ShieldCheck, Download } from 'lucide-react';
import {
  SERVICES,
  DEFAULT_SENDER,
  DEFAULT_PACKAGE,
  DEFAULT_API_TOKEN,
  DEFAULT_ENV,
  MOCK_CSV_ORDERS,
} from './constants/shipping';
import { useLocalStorage } from './hooks/useLocalStorage';
import { cleanCep, validateOrder } from './utils/validators';
import { parseCSVOrders, exportMelhorEnvioCSV } from './utils/csv';
import { buildMelhorEnvioPayload, pushOrderToCart } from './services/melhorEnvio';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { StatsCards } from './components/StatsCards';
import { CsvUploader } from './components/CsvUploader';
import { OrdersTable } from './components/OrdersTable';
import { ActivityLog } from './components/ActivityLog';
import { EditOrderModal } from './components/EditOrderModal';
import { SenderSettings } from './components/SenderSettings';

export default function App() {
  const [activeTab, setActiveTab] = useState('orders');

  // Persisted Sender & API Configuration
  const [sender, setSender] = useLocalStorage('poke_me_sender', DEFAULT_SENDER);
  const [apiToken, setApiToken] = useLocalStorage('poke_me_token', DEFAULT_API_TOKEN);
  const [environment, setEnvironment] = useLocalStorage('poke_me_env', DEFAULT_ENV);
  const [packageSettings, setPackageSettings] = useLocalStorage(
    'poke_me_package',
    DEFAULT_PACKAGE
  );

  // Orders State
  const [orders, setOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [editingOrder, setEditingOrder] = useState(null);

  // UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [logMessages, setLogMessages] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  const [corsNoticeVisible, setCorsNoticeVisible] = useState(false);

  const showToast = (message, type = 'info') => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast(null);
    }, 4500);
  };

  const handleLoadCSVContent = (content) => {
    try {
      const { orders: parsed, error } = parseCSVOrders(content);
      if (error) {
        showToast(error, 'error');
        return;
      }
      setOrders(parsed);
      setSelectedOrderIds(new Set(parsed.map((o) => o.id)));
      showToast(`${parsed.length} pedidos carregados com sucesso da planilha!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Falha ao processar CSV. Verifique o formato do arquivo.', 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.size === orders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(orders.map((o) => o.id)));
    }
  };

  const toggleSelectOrder = (id) => {
    const next = new Set(selectedOrderIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedOrderIds(next);
  };

  const handleApplyServiceToSelected = (serviceId) => {
    const numId = Number(serviceId);
    setOrders((prev) =>
      prev.map((o) => (selectedOrderIds.has(o.id) ? { ...o, service_id: numId } : o))
    );
    showToast(
      `Serviço alterado para ${SERVICES.find((s) => s.id === numId)?.name} nos selecionados.`,
      'info'
    );
  };

  const updateOrderService = (orderId, serviceId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, service_id: serviceId } : o))
    );
  };

  const updateOrderValue = (orderId, value) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, value } : o)));
  };

  const handlePushToMelhorEnvio = async () => {
    const selectedOrders = orders.filter((o) => selectedOrderIds.has(o.id));
    if (selectedOrders.length === 0) {
      showToast('Selecione pelo menos um pedido para enviar.', 'error');
      return;
    }

    if (!cleanCep(sender.postal_code) || cleanCep(sender.postal_code).length !== 8) {
      showToast('Verifique o CEP do Remetente nas Configurações.', 'error');
      setActiveTab('sender');
      return;
    }

    setIsProcessing(true);
    setProcessProgress(0);
    setLogMessages([]);
    setCorsNoticeVisible(false);

    const baseUrl = environment === 'sandbox' ? '/api-me-sandbox' : '/api-me';
    let successCount = 0;
    let failCount = 0;
    const logs = [];

    for (let i = 0; i < selectedOrders.length; i++) {
      const order = selectedOrders[i];
      const payload = buildMelhorEnvioPayload(order, sender, packageSettings);
      const validation = validateOrder(order);

      if (!validation.isValid) {
        logs.push(
          `⚠️ [${order.id}] Ignorado ou com dados incompletos: ${validation.issues.join(', ')}`
        );
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? { ...o, status: 'error', error_msg: validation.issues.join('; ') }
              : o
          )
        );
        failCount++;
        setProcessProgress(Math.round(((i + 1) / selectedOrders.length) * 100));
        continue;
      }

      try {
        logs.push(`🚀 Enviando pedido ${order.id} (${order.name}) para ${baseUrl}/me/cart...`);
        setLogMessages([...logs]);

        const result = await pushOrderToCart({ baseUrl, apiToken, payload });

        if (result.ok) {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === order.id
                ? { ...o, status: 'sent', cart_id: result.cartId, error_msg: null }
                : o
            )
          );
          if (result.simulated) {
            logs.push(
              `✅ [${order.id}] Adicionado com sucesso (Modo Simulação / Token Demo). ID do Carrinho: ${result.cartId}`
            );
          } else {
            logs.push(`✅ [${order.id}] Adicionado com sucesso ao carrinho ME! ID: ${result.cartId}`);
          }
          successCount++;
        } else {
          logs.push(`❌ [${order.id}] Erro da API do Melhor Envio: ${result.errorDetail}`);
          setOrders((prev) =>
            prev.map((o) =>
              o.id === order.id ? { ...o, status: 'error', error_msg: result.errorDetail } : o
            )
          );
          failCount++;
        }
      } catch (err) {
        console.error('Fetch error:', err);
        const isCors = err.name === 'TypeError' && err.message.includes('fetch');
        if (isCors) {
          setCorsNoticeVisible(true);
          logs.push(
            `🔒 [${order.id}] Bloqueio de CORS do Navegador detectado! As APIs do Melhor Envio exigem proxy ou exportação direta via planilha.`
          );
        } else {
          logs.push(`❌ [${order.id}] Erro de conexão: ${err.message}`);
        }

        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  status: 'error',
                  error_msg: isCors
                    ? 'Bloqueio de CORS pelo navegador (Use a Planilha de Envio em Lote)'
                    : err.message,
                }
              : o
          )
        );
        failCount++;
      }

      setProcessProgress(Math.round(((i + 1) / selectedOrders.length) * 100));
      setLogMessages([...logs]);
    }

    setIsProcessing(false);

    if (successCount > 0) {
      showToast(`${successCount} pedido(s) adicionados ao carrinho com sucesso!`, 'success');
    } else if (failCount > 0) {
      showToast(
        'Houve falha no envio direto. Confira as opções de exportação em planilha.',
        'error'
      );
    }
  };

  const handleDownloadMelhorEnvioCSV = () => {
    const selectedOrders = orders.filter((o) => selectedOrderIds.has(o.id));
    const targetOrders = selectedOrders.length > 0 ? selectedOrders : orders;

    if (targetOrders.length === 0) {
      showToast('Nenhum pedido para exportar.', 'error');
      return;
    }

    exportMelhorEnvioCSV({
      orders: targetOrders,
      sender,
      packageSettings,
    });

    showToast('Planilha padrão do Melhor Envio descarregada!', 'success');
  };

  const handleSaveEditOrder = (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === editingOrder.id ? { ...editingOrder, error_msg: null } : o))
    );
    setEditingOrder(null);
    showToast('Pedido atualizado!', 'success');
  };

  const removeOrder = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const valid = orders.filter((o) => validateOrder(o).isValid).length;
    const sent = orders.filter((o) => o.status === 'sent').length;
    const errors = orders.filter((o) => o.status === 'error' || !validateOrder(o).isValid).length;
    return { total, valid, sent, errors };
  }, [orders]);

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} ordersCount={orders.length} />

      <Toast activeToast={activeToast} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <StatsCards stats={stats} />

            <CsvUploader
              onContentLoaded={handleLoadCSVContent}
              onLoadMock={() => handleLoadCSVContent(MOCK_CSV_ORDERS)}
              hasOrders={orders.length > 0}
              onClearOrders={() => setOrders([])}
            />

            {corsNoticeVisible && (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-red-200">
                <div className="flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-red-300 text-sm font-semibold">
                      Dica de Integração com o Melhor Envio:
                    </strong>
                    O navegador bloqueou a requisição direta por política de segurança (CORS da
                    API do Melhor Envio). Para despachar sem precisar de backend proxy, clique em{' '}
                    <strong>&quot;Baixar Planilha Padrão ME&quot;</strong> e importe o arquivo
                    diretamente na calculadora do Melhor Envio com 1 clique!
                  </div>
                </div>
                <button
                  onClick={handleDownloadMelhorEnvioCSV}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shrink-0 transition flex items-center space-x-1.5 shadow-md shadow-red-600/25"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Planilha ME</span>
                </button>
              </div>
            )}

            <OrdersTable
              orders={orders}
              selectedOrderIds={selectedOrderIds}
              onToggleSelectAll={toggleSelectAll}
              onToggleSelectOrder={toggleSelectOrder}
              onApplyServiceToSelected={handleApplyServiceToSelected}
              onUpdateOrderService={updateOrderService}
              onUpdateOrderValue={updateOrderValue}
              onEditOrder={setEditingOrder}
              onRemoveOrder={removeOrder}
              onDownloadCSV={handleDownloadMelhorEnvioCSV}
              onPushToMelhorEnvio={handlePushToMelhorEnvio}
              isProcessing={isProcessing}
              processProgress={processProgress}
            />

            <ActivityLog
              logMessages={logMessages}
              isProcessing={isProcessing}
              onClearLogs={() => setLogMessages([])}
            />
          </div>
        )}

        {activeTab === 'sender' && (
          <SenderSettings
            sender={sender}
            setSender={setSender}
            apiToken={apiToken}
            setApiToken={setApiToken}
            environment={environment}
            setEnvironment={setEnvironment}
            packageSettings={packageSettings}
            setPackageSettings={setPackageSettings}
            onSaveToast={() =>
              showToast('Remetente, Chave de API e Cubagem salvos no navegador!', 'success')
            }
          />
        )}
      </main>

      <EditOrderModal
        editingOrder={editingOrder}
        setEditingOrder={setEditingOrder}
        onSave={handleSaveEditOrder}
      />

      <footer className="border-t border-red-950/60 bg-zinc-950/90 py-4 text-center text-xs text-zinc-500">
        <p>
          <span className="text-red-500 font-bold">R</span> • Equipe Rocket TCG Logistics •
          LigaPokemon / LigaMagic ➔ Melhor Envio • Decolando na velocidade da luz!
        </p>
      </footer>
    </div>
  );
}