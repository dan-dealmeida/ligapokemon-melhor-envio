import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Package, 
  UploadCloud, 
  Settings, 
  ExternalLink, 
  Download, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Sparkles, 
  ShieldCheck, 
  Info, 
  Check, 
  AlertCircle,
  Truck,
  ArrowRight,
  Eye,
  Key,
  Layers
} from 'lucide-react';

const SERVICES = [
  { id: 17, name: 'Correios Mini Envios', carrier: 'Correios', code: 'MINI' },
  { id: 1, name: 'Correios PAC', carrier: 'Correios', code: 'PAC' },
  { id: 2, name: 'Correios SEDEX', carrier: 'Correios', code: 'SEDEX' },
  { id: 3, name: 'Jadlog .Package', carrier: 'Jadlog', code: '.Package' },
  { id: 4, name: 'Jadlog .Com', carrier: 'Jadlog', code: '.Com' },
];

const DEFAULT_SENDER = {
  name: 'PokeStore Brasil TCG',
  company: 'PokeStore Colecionáveis LTDA',
  document: '32.145.987/0001-50',
  email: 'contato@pokestorebrasil.com.br',
  phone: '11988887777',
  postal_code: '01310-100',
  address: 'Avenida Paulista',
  number: '1000',
  complement: 'Sala 42',
  district: 'Bela Vista',
  city: 'São Paulo',
  state_abbr: 'SP',
};

const DEFAULT_PACKAGE = {
  height: 2, // cm (envelope bolha padrão para singles / cartas)
  width: 11, // cm
  length: 16, // cm
  weight: 0.1, // kg (100g mínimo seguro)
};

const MOCK_CSV_ORDERS = `Pedido;Destinatário;CPF;Telefone;CEP;Endereço;Número;Complemento;Bairro;Cidade;UF;Valor Total
#LP-8921;Lucas Oliveira Silveira;123.456.789-00;11987654321;04571-010;Avenida Engenheiro Luís Carlos Berrini;500;Apto 102;Itaim Bibi;São Paulo;SP;189.90
#LP-8922;Mariana Santos Costa;987.654.321-99;21998761234;22041-001;Rua Barata Ribeiro;200;;Copacabana;Rio de Janeiro;RJ;450.00
#LP-8923;Rafael Albuquerque;456.789.123-55;31988776655;30130-100;Avenida Afonso Pena;1500;Bloco B;Centro;Belo Horizonte;MG;85.50
#LP-8924;Camila Souza Mendes; ;41977665544;80020-310;Rua Marechal Deodoro;100;Conj 12;Centro;Curitiba;PR;320.00
#LP-8925;Gabriel Duarte Lima;321.654.987-11; ;01001-000;Praça da Sé;S/N;;Sé;São Paulo;SP;65.00`;

const cleanDoc = (doc) => (doc || '').replace(/\D/g, '');
const cleanCep = (cep) => (cep || '').replace(/\D/g, '');

const validateOrder = (order) => {
  const issues = [];
  const cepClean = cleanCep(order.postal_code);
  const docClean = cleanDoc(order.document);

  if (!order.name || order.name.trim().length < 3) issues.push('Nome incompleto');
  if (!cepClean || cepClean.length !== 8) issues.push('CEP inválido (precisa ter 8 dígitos)');
  if (!order.address || order.address.trim().length < 3) issues.push('Endereço incompleto');
  if (!order.number) issues.push('Número ausente');
  if (!order.city) issues.push('Cidade ausente');
  if (!order.state_abbr || order.state_abbr.length !== 2) issues.push('UF inválida');
  if (!docClean || (docClean.length !== 11 && docClean.length !== 14)) {
    issues.push('CPF/CNPJ ausente ou com dígitos incorretos');
  }

  return {
    isValid: issues.length === 0,
    hasCriticalErrors: issues.some(i => i.includes('CEP') || i.includes('Endereço')),
    issues
  };
};

export default function App() {
  // Tabs: 'orders', 'sender', 'payload', 'export'
  const [activeTab, setActiveTab] = useState('orders');

  // Sender & API Configuration
  const [sender, setSender] = useState(() => {
    const saved = localStorage.getItem('poke_me_sender');
    return saved ? JSON.parse(saved) : DEFAULT_SENDER;
  });

  const [apiToken, setApiToken] = useState(() => {
    return localStorage.getItem('poke_me_token') || '';
  });

  const [environment, setEnvironment] = useState(() => {
    return localStorage.getItem('poke_me_env') || 'sandbox';
  });

  const [packageSettings, setPackageSettings] = useState(() => {
    const saved = localStorage.getItem('poke_me_package');
    return saved ? JSON.parse(saved) : DEFAULT_PACKAGE;
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [defaultServiceId, setDefaultServiceId] = useState(1);
  const [editingOrder, setEditingOrder] = useState(null);
  
  // UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [logMessages, setLogMessages] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  const [corsNoticeVisible, setCorsNoticeVisible] = useState(false);
  const [generatedPayload, setGeneratedPayload] = useState(null);
  
  const fileInputRef = useRef(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('poke_me_sender', JSON.stringify(sender));
  }, [sender]);

  useEffect(() => {
    localStorage.setItem('poke_me_token', apiToken);
  }, [apiToken]);

  useEffect(() => {
    localStorage.setItem('poke_me_env', environment);
  }, [environment]);

  useEffect(() => {
    localStorage.setItem('poke_me_package', JSON.stringify(packageSettings));
  }, [packageSettings]);

  const showToast = (message, type = 'info') => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast(null);
    }, 4500);
  };

  // Analisa o texto da coluna MODALIDADE ou FORMA DE ENVIO
  const detectShippingService = (shippingText) => {
    if (!shippingText) return 17; // Padrão para cartas Pokémon TCG (Mini Envios)
    
    const text = shippingText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (text.includes('sedex')) {
      return 2; // Correios SEDEX
    }
    if (text.includes('mini') || text.includes('carta')) {
      return 17; // Correios Mini Envios
    }
    if (text.includes('pac')) {
      return 1; // Correios PAC
    }
    if (text.includes('jadlog') || text.includes('package')) {
      return 3; // Jadlog .Package
    }

    // Fallback padrão para pedidos da LigaPokemon
    return 17;
  };

  const parsePrice = (valStr) => {
    if (!valStr) return 20.0;
    let clean = String(valStr).replace('R$', '').trim();

    // Caso tenha ponto de milhar e vírgula de decimal: ex: 1.250,50
    if (clean.includes(',') && clean.includes('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } 
    // Caso use apenas vírgula para decimal: ex: 2,50
    else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }
    // Se contiver apenas ponto (ex: 2.00), mantém como decimal padrão

    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 20.0 : parsed;
  };

  const parseCSVContent = (content) => {
    try {
      const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        showToast('O arquivo CSV parece estar vazio ou não tem cabeçalho.', 'error');
        return;
      }

      // Detect separator: ';' or ','
      const headerLine = lines[0];
      const separator = (headerLine.match(/;/g) || []).length >= (headerLine.match(/,/g) || []).length ? ';' : ',';
      
      const rawHeaders = headerLine.split(separator).map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

      // Helper column finder
      const findIndex = (...candidates) => {
        return rawHeaders.findIndex(h => candidates.some(c => h.includes(c.toLowerCase())));
      };
      

      const idIdx = findIndex('pedido', 'id', 'código', 'numero pedido');
      const nameIdx = findIndex('destinatário', 'destinatario', 'nome', 'cliente', 'comprador');
      const docIdx = findIndex('cpf', 'cnpj', 'documento');
      const phoneIdx = findIndex('telefone', 'celular', 'fone', 'contato');
      const cepIdx = findIndex('cep', 'postal');
      const addressIdx = findIndex('endereço', 'endereco', 'rua', 'logradouro');
      const numberIdx = findIndex('número', 'numero', 'nº');
      const compIdx = findIndex('complemento', 'comp');
      const districtIdx = findIndex('bairro');
      const cityIdx = findIndex('cidade', 'município', 'municipio');
      const ufIdx = findIndex('uf', 'estado', 'sigla');
      const totalIdx = findIndex('valor', 'total', 'preço', 'preco');
      const shippingIdx = findIndex('modalidade', 'forma de envio', 'forma_envio', 'tipo envio', 'envio');
      const emailIdx = findIndex('emailcliente', 'email', 'e-mail', 'mail');


      const parsed = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(separator).map(val => val.trim().replace(/^["']|["']$/g, ''));
        if (row.length < 2) continue;

        const orderId = idIdx !== -1 && row[idIdx] ? row[idIdx] : `#PED-${1000 + i}`;
        const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : `Cliente ${i}`;
        const document = docIdx !== -1 && row[docIdx] ? row[docIdx] : '';
        const phone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx] : '';
        const cep = cepIdx !== -1 && row[cepIdx] ? row[cepIdx] : '';
        const address = addressIdx !== -1 && row[addressIdx] ? row[addressIdx] : '';
        const number = numberIdx !== -1 && row[numberIdx] ? row[numberIdx] : 'S/N';
        const rawComplement = compIdx !== -1 && row[compIdx] ? row[compIdx].trim() : '';
        const complement = (rawComplement === 'null' || rawComplement === 'undefined') ? '': rawComplement;
        const district = districtIdx !== -1 && row[districtIdx] ? row[districtIdx] : 'Centro';
        const city = cityIdx !== -1 && row[cityIdx] ? row[cityIdx] : '';
        const uf = ufIdx !== -1 && row[ufIdx] ? row[ufIdx].toUpperCase().substring(0, 2) : 'SP';
        const rawShippingMethod = shippingIdx !== -1 && row[shippingIdx] ? row[shippingIdx] : '';
        const detectedServiceId = detectShippingService(rawShippingMethod);
        const email = emailIdx !== -1 && row[emailIdx] ? row[emailIdx].trim() : '';
        
        // Verifica se é retirada no local
        const isPickup = rawShippingMethod.toLowerCase().includes('balcao') || 
                         rawShippingMethod.toLowerCase().includes('retirar');
        
        let value = 20.0;
        if (totalIdx !== -1 && row[totalIdx]) {
          value = parsePrice(row[totalIdx]);
        }

        parsed.push({
          id: orderId,
          name,
          email,
          document,
          phone,
          postal_code: cep,
          address,
          number,
          complement,
          district,
          city,
          state_abbr: uf,
          value,
          shipping_method_original: rawShippingMethod, // Guarda o texto original da Liga
          service_id: detectedServiceId, // Pré-seleciona Mini Envios, PAC ou SEDEX sozinho
          is_pickup: isPickup,
          status: isPickup ? 'error' : 'pending',
          error_msg: isPickup ? 'Pedido marcado como "Retirar no balcão"' : null,
          cart_id: null,
        });
      }

      if (parsed.length === 0) {
        showToast('Nenhum pedido pôde ser extraído do arquivo.', 'error');
        return;
      }

      setOrders(parsed);
      setSelectedOrderIds(new Set(parsed.map(o => o.id)));
      showToast(`${parsed.length} pedidos carregados com sucesso da planilha!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Falha ao processar CSV. Verifique o formato do arquivo.', 'error');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        parseCSVContent(content);
      }
    };
    reader.readAsText(file, 'ISO-8859-1');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadMockData = () => {
    parseCSVContent(MOCK_CSV_ORDERS);
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.size === orders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(orders.map(o => o.id)));
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
    setOrders(prev => prev.map(o => {
      if (selectedOrderIds.has(o.id)) {
        return { ...o, service_id: Number(serviceId) };
      }
      return o;
    }));
    showToast(`Serviço alterado para ${SERVICES.find(s => s.id === Number(serviceId))?.name} nos selecionados.`, 'info');
  };

 const buildMelhorEnvioPayload = (order) => {
    const rawFromDoc = cleanDoc(sender.document);
    const cleanToDoc = cleanDoc(order.document);
    const cleanFromCep = cleanCep(sender.postal_code);
    const cleanToCep = cleanCep(order.postal_code);

    // Identifica se o remetente é CNPJ (14 dígitos) ou CPF (11 dígitos)
    const isCompany = rawFromDoc.length === 14;

    return {
      service: order.service_id,
      from: {
        name: sender.name,
        phone: cleanDoc(sender.phone),
        email: sender.email,
        // Se for CNPJ, document deve ser null e company_document recebe o CNPJ
        document: isCompany ? null : rawFromDoc,
        company_document: isCompany ? rawFromDoc : null,
        address: sender.address,
        complement: sender.complement || '',
        number: sender.number || 'S/N',
        district: sender.district,
        city: sender.city,
        state_abbr: sender.state_abbr,
        country_id: 'BR',
        postal_code: cleanFromCep
      },
      to: {
        name: order.name,
        phone: cleanDoc(order.phone) || cleanDoc(sender.phone),
        email: order.email || sender.email || 'simaocardsoficial@gmail.com',
        document: cleanToDoc, // Precisa ser um CPF com dígito verificador válido
        address: order.address,
        complement: order.complement || '',
        number: order.number || 'S/N',
        district: order.district || 'Centro',
        city: order.city,
        state_abbr: order.state_abbr,
        country_id: 'BR',
        postal_code: cleanToCep,
        note: `Pedido Liga: ${order.id}`
      },
      // OBRIGATÓRIO quando non_commercial: true (Declaração de Conteúdo)
      products: [
        {
          name: `Cartas Pokémon TCG - Pedido ${order.id}`,
          quantity: 1,
          unitary_value: Math.max(Number(order.value) || 20, 1)
        }
      ],
      package: {
        height: Number(packageSettings.height) || 2,
        width: Number(packageSettings.width) || 11,
        length: Number(packageSettings.length) || 16,
        weight: Number(packageSettings.weight) || 0.1
      },
      options: {
        insurance_value: Math.min(Math.max(Number(order.value) || 20, 20), 5000),
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: true
      }
    };
  };

  const handlePushToMelhorEnvio = async () => {
    const selectedOrders = orders.filter(o => selectedOrderIds.has(o.id));
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
    const baseUrl = environment === 'sandbox' 
          ? '/api-me-sandbox'
          : '/api-me';

        let successCount = 0;
        let failCount = 0;

    // Build payload previews
    const samplePayloads = selectedOrders.map(o => buildMelhorEnvioPayload(o));
    setGeneratedPayload(samplePayloads);

    const logs = [];

    for (let i = 0; i < selectedOrders.length; i++) {
      const order = selectedOrders[i];
      const payload = buildMelhorEnvioPayload(order);
      const validation = validateOrder(order);

      if (!validation.isValid) {
        logs.push(`⚠️ [${order.id}] Ignorado ou com dados incompletos: ${validation.issues.join(', ')}`);
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'error', error_msg: validation.issues.join('; ') } : o));
        failCount++;
        setProcessProgress(Math.round(((i + 1) / selectedOrders.length) * 100));
        continue;
      }

      try {
        logs.push(`🚀 Enviando pedido ${order.id} (${order.name}) para ${baseUrl}/me/cart...`);
        setLogMessages([...logs]);

        // If no token or demo token provided, provide instant realistic simulation
        if (!apiToken || apiToken.trim().length < 15 || apiToken === 'demo_token') {
          await new Promise(r => setTimeout(r, 600));
          const simulatedCartId = 'sim_' + Math.random().toString(36).substring(2, 9);
          
          setOrders(prev => prev.map(o => o.id === order.id ? { 
            ...o, 
            status: 'sent', 
            cart_id: simulatedCartId,
            error_msg: null 
          } : o));

          logs.push(`✅ [${order.id}] Adicionado com sucesso (Modo Simulação / Token Demo). ID do Carrinho: ${simulatedCartId}`);
          successCount++;
        } else {
          // Attempt real API request
          const response = await fetch(`${baseUrl}/me/cart`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiToken.trim()}`
            },
            body: JSON.stringify(payload)
          });

          const data = await response.json();

          if (response.ok) {
            logs.push(`✅ [${order.id}] Adicionado com sucesso ao carrinho ME! ID: ${data.id || 'OK'}`);
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'sent', cart_id: data.id, error_msg: null } : o));
            successCount++;
          } else {
            const errDetail = data?.message || data?.error || JSON.stringify(data);
            logs.push(`❌ [${order.id}] Erro da API do Melhor Envio: ${errDetail}`);
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'error', error_msg: errDetail } : o));
            failCount++;
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        // Browser CORS Block detector
        const isCors = err.name === 'TypeError' && err.message.includes('fetch');
        if (isCors) {
          setCorsNoticeVisible(true);
          logs.push(`🔒 [${order.id}] Bloqueio de CORS do Navegador detectado! As APIs do Melhor Envio exigem proxy ou exportação direta via planilha.`);
        } else {
          logs.push(`❌ [${order.id}] Erro de conexão: ${err.message}`);
        }
        
        // Mark as fallback state
        setOrders(prev => prev.map(o => o.id === order.id ? { 
          ...o, 
          status: 'error', 
          error_msg: isCors ? 'Bloqueio de CORS pelo navegador (Use a Planilha de Envio em Lote)' : err.message 
        } : o));
        failCount++;
      }

      setProcessProgress(Math.round(((i + 1) / selectedOrders.length) * 100));
      setLogMessages([...logs]);
    }

    setIsProcessing(false);

    if (successCount > 0) {
      showToast(`${successCount} pedido(s) adicionados ao carrinho com sucesso!`, 'success');
    } else if (failCount > 0) {
      showToast(`Houve falha no envio direto. Confira as opções de exportação em planilha.`, 'error');
    }
  };

  const downloadMelhorEnvioCSV = () => {
    const selectedOrders = orders.filter(o => selectedOrderIds.has(o.id));
    const targetOrders = selectedOrders.length > 0 ? selectedOrders : orders;

    if (targetOrders.length === 0) {
      showToast('Nenhum pedido para exportar.', 'error');
      return;
    }

    // Standard column layout accepted by Melhor Envio Batch Upload / Spreadsheet
    const headers = [
      'Serviço',
      'Nome do Destinatário',
      'Telefone do Destinatário',
      'Email do Destinatário',
      'Documento do Destinatário',
      'CEP do Destinatário',
      'Endereço do Destinatário',
      'Número',
      'Complemento',
      'Bairro',
      'Cidade',
      'UF',
      'Altura (cm)',
      'Largura (cm)',
      'Comprimento (cm)',
      'Peso (kg)',
      'Valor Assegurado (R$)',
      'Aviso de Recebimento',
      'Mão Própria',
      'Informações Adicionais / Pedido'
    ];

    const rows = targetOrders.map(order => {
      const srv = SERVICES.find(s => s.id === order.service_id) || SERVICES[0];
      return [
        srv.name,
        `"${(order.name || '').replace(/"/g, '""')}"`,
        `"${cleanDoc(order.phone) || cleanDoc(sender.phone)}"`,
        `"${order.email || 'comprador@ligapokemon.com.br'}"`,
        `"${cleanDoc(order.document)}"`,
        `"${cleanCep(order.postal_code)}"`,
        `"${(order.address || '').replace(/"/g, '""')}"`,
        `"${order.number || 'S/N'}"`,
        `"${(order.complement || '').replace(/"/g, '""')}"`,
        `"${(order.district || 'Centro').replace(/"/g, '""')}"`,
        `"${(order.city || '').replace(/"/g, '""')}"`,
        `"${(order.state_abbr || 'SP').toUpperCase()}"`,
        packageSettings.height,
        packageSettings.width,
        packageSettings.length,
        packageSettings.weight,
        Number(order.value).toFixed(2).replace('.', ','),
        'Não',
        'Não',
        `"Pedido LigaPokemon ${order.id}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `melhor_envio_lote_ligapokemon_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Planilha padrão do Melhor Envio descarregada!', 'success');
  };

  const handleSaveEditOrder = (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    setOrders(prev => prev.map(o => o.id === editingOrder.id ? { ...editingOrder, error_msg: null } : o));
    setEditingOrder(null);
    showToast('Pedido atualizado!', 'success');
  };

  const removeOrder = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const valid = orders.filter(o => validateOrder(o).isValid).length;
    const sent = orders.filter(o => o.status === 'sent').length;
    const errors = orders.filter(o => o.status === 'error' || !validateOrder(o).isValid).length;
    return { total, valid, sent, errors };
  }, [orders]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-red-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  LigaPokemon ➔ Melhor Envio
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  TCG Bridge
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Conversor e despachante inteligente de pedidos para o Melhor Envio
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'orders' 
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Pedidos ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sender')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'sender' 
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Remetente & API</span>
            </button>

            <a
              href="https://melhorenvio.com.br/painel/carrinho"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition flex items-center space-x-1.5"
            >
              <span>Carrinho ME</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce transition-all">
          <div className={`flex items-center space-x-2 px-4 py-3 rounded-xl shadow-2xl border text-sm ${
            activeToast.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-900/30'
              : activeToast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-900/30'
              : 'bg-slate-900/90 text-slate-200 border-slate-700 shadow-slate-950/50'
          }`}>
            {activeToast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {activeToast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {activeToast.type === 'info' && <Info className="w-5 h-5 text-amber-400 shrink-0" />}
            <span>{activeToast.message}</span>
          </div>
        </div>
      )}

      {}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Tab 1: Orders Management */}
        {activeTab === 'orders' && (
          <div className="space-y-6">

            {/* Top metrics and Quick Actions */}
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

            {/* Drag and Drop Upload Area */}
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
                    onClick={loadMockData}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Carregar Pedidos de Teste (Mock TCG)</span>
                  </button>

                  {orders.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setOrders([])}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 transition flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpar Lista</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* CORS Warning / Solutions Alert Banner */}
            {corsNoticeVisible && (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
                <div className="flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-300 text-sm font-semibold">
                      Dica de Integração com o Melhor Envio:
                    </strong>
                    O navegador bloqueou a requisição direta por política de segurança (CORS da API do Melhor Envio). 
                    Para despachar sem precisar de backend proxy, clique em <strong>"Baixar Planilha Padrão ME"</strong> e importe o arquivo diretamente na calculadora do Melhor Envio com 1 clique!
                  </div>
                </div>
                <button
                  onClick={downloadMelhorEnvioCSV}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 transition flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Planilha ME</span>
                </button>
              </div>
            )}

            {/* Orders Table Container */}
            {orders.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {/* Bulk Actions Bar */}
                <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 text-xs">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.size === orders.length && orders.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-800"
                      />
                      <span className="font-semibold text-slate-200">
                        Selecionar Todos ({selectedOrderIds.size}/{orders.length})
                      </span>
                    </label>

                    <div className="h-4 w-px bg-slate-700 hidden sm:block" />

                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400">Aplicar serviço em lote:</span>
                      <select
                        onChange={(e) => handleApplyServiceToSelected(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Escolher serviço...</option>
                        {SERVICES.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={downloadMelhorEnvioCSV}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5"
                      title="Gera a planilha oficial do Melhor Envio pronta para importação em lote"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Baixar Planilha ME</span>
                    </button>

                    <button
                      onClick={handlePushToMelhorEnvio}
                      disabled={isProcessing || selectedOrderIds.size === 0}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Enviando ({processProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Adicionar {selectedOrderIds.size} ao Carrinho ME</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress bar when running batch */}
                {isProcessing && (
                  <div className="w-full bg-slate-800 h-1.5">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-1.5 transition-all duration-300"
                      style={{ width: `${processProgress}%` }}
                    />
                  </div>
                )}

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
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
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.map((order) => {
                        const validation = validateOrder(order);
                        const isSelected = selectedOrderIds.has(order.id);

                        return (
                          <tr 
                            key={order.id} 
                            className={`hover:bg-slate-800/40 transition ${
                              isSelected ? 'bg-amber-500/5' : ''
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectOrder(order.id)}
                                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-800 cursor-pointer"
                              />
                            </td>

                            <td className="p-3 font-mono font-semibold text-slate-200">
                              {order.id}
                            </td>

                            <td className="p-3">
                              <div className="font-medium text-slate-100">{order.name}</div>
                              {order.email && (
                                <div className="text-[11px] text-slate-400 truncate max-w-[190px]" title={order.email}>
                                  {order.email}
                                </div>
                              )}
                              <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                                <span>Doc:</span>
                                <span className={order.document ? 'text-slate-300' : 'text-rose-400 font-semibold'}>
                                  {order.document || 'Não informado'}
                                </span>
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="text-slate-200">
                                {order.city || <span className="text-rose-400 font-medium">Sem cidade</span>} - {order.state_abbr || '??'}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[200px]" title={`${order.address}, ${order.number}${order.complement ? ' - ' + order.complement : ''}`}>
                                {order.address}, {order.number}
                                {order.complement && (
                                  <span className="text-amber-400/90 ml-1 font-medium">
                                    ({order.complement})
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-3 font-mono">
                              {cleanCep(order.postal_code).length === 8 ? (
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
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
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setOrders(prev => prev.map(o => o.id === order.id ? { ...o, service_id: val } : o));
                                }}
                                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                              >
                                {SERVICES.map(srv => (
                                  <option key={srv.id} value={srv.id}>{srv.name}</option>
                                ))}
                              </select>
                            </td>

                            {/* DEPOIS: input direto na linha da tabela */}
                              <td className="p-3">
                                <div className="flex items-center space-x-1 font-mono">
                                  <span className="text-slate-500 text-xs">R$</span>
                                  <input
                                    type="number"
                                    step="0.50"
                                    min="1"
                                    value={order.value}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, value: val } : o));
                                    }}
                                    className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500"
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
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-emerald-400 border border-emerald-900/40">
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
                                  onClick={() => setEditingOrder(order)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                                  title="Editar dados deste pedido"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeOrder(order.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
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
            )}

            {/* Real-time Activity Logs */}
            {logMessages.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className={`w-4 h-4 text-amber-400 ${isProcessing ? 'animate-spin' : ''}`} />
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Log de Processamento</h3>
                  </div>
                  <button 
                    onClick={() => setLogMessages([])}
                    className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                  >
                    Limpar
                  </button>
                </div>
                <div className="mt-3 font-mono text-xs text-slate-300 space-y-1.5 max-h-48 overflow-y-auto pr-2">
                  {logMessages.map((msg, i) => (
                    <div key={i} className="leading-relaxed">{msg}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sender & API Settings */}
        {activeTab === 'sender' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Col: Remetente Loja */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <span>Dados do Remetente (Sua Loja de Pokémon TCG)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Estes dados serão utilizados como origem no cálculo de frete e nas etiquetas do Melhor Envio.
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
                  <label className="block text-slate-300 font-medium mb-1">Razão Social / Nome Completo</label>
                  <input
                    type="text"
                    value={sender.company}
                    onChange={(e) => setSender({ ...sender, company: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">CPF ou CNPJ do Remetente *</label>
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
                      onChange={(e) => setSender({ ...sender, state_abbr: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 uppercase text-center font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => showToast('Dados do remetente salvos no navegador!', 'success')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                >
                  Salvar Remetente
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
                    <label className="block text-slate-300 font-medium mb-1">Personal Access Token (Bearer)</label>
                    <textarea
                      rows={3}
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      placeholder="Cole aqui seu token gerado no Melhor Envio (ou deixe vazio para modo simulação)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Gerado em: Painel ME &gt; Integrações &gt; Gerar Token
                    </p>
                  </div>
                </div>
              </div>

              {/* Package Dimensions Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Cubagem Padrão (Singles / Cartas)</h3>
                    <p className="text-[11px] text-slate-400">Valores mínimos aceitos pelas transportadoras</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Altura (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={packageSettings.height}
                      onChange={(e) => setPackageSettings({ ...packageSettings, height: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Largura (cm)</label>
                    <input
                      type="number"
                      value={packageSettings.width}
                      onChange={(e) => setPackageSettings({ ...packageSettings, width: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Comprimento (cm)</label>
                    <input
                      type="number"
                      value={packageSettings.length}
                      onChange={(e) => setPackageSettings({ ...packageSettings, length: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={packageSettings.weight}
                      onChange={(e) => setPackageSettings({ ...packageSettings, weight: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono text-center"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400 leading-relaxed">
                  💡 <strong>Por que usar 16x11x2cm?</strong> Correios e Jadlog cobram erro de cubagem caso o pacote tenha menos que 15cm ou menos que 100g, mesmo em envelopes finos com cartas Pokémon avulsas.
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Editar Pedido {editingOrder.id}</span>
              </h3>
              <button 
                onClick={() => setEditingOrder(null)}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome do Destinatário</label>
                <input
                  type="text"
                  value={editingOrder.name}
                  onChange={(e) => setEditingOrder({ ...editingOrder, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">CPF / CNPJ</label>
                  <input
                    type="text"
                    value={editingOrder.document}
                    onChange={(e) => setEditingOrder({ ...editingOrder, document: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">CEP</label>
                  <input
                    type="text"
                    value={editingOrder.postal_code}
                    onChange={(e) => setEditingOrder({ ...editingOrder, postal_code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Endereço (Rua / Logradouro)</label>
                <input
                  type="text"
                  value={editingOrder.address}
                  onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Número</label>
                  <input
                    type="text"
                    value={editingOrder.number}
                    onChange={(e) => setEditingOrder({ ...editingOrder, number: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Complemento</label>
                  <input
                    type="text"
                    value={editingOrder.complement}
                    onChange={(e) => setEditingOrder({ ...editingOrder, complement: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bairro</label>
                  <input
                    type="text"
                    value={editingOrder.district}
                    onChange={(e) => setEditingOrder({ ...editingOrder, district: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cidade</label>
                  <input
                    type="text"
                    value={editingOrder.city}
                    onChange={(e) => setEditingOrder({ ...editingOrder, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={editingOrder.state_abbr}
                    onChange={(e) => setEditingOrder({ ...editingOrder, state_abbr: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase text-center font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-lg shadow-amber-500/20"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          LigaPokemon / LigaMagic ➔ Melhor Envio Bridge • Feito para agilizar o envio de singles e produtos colecionáveis.
        </p>
      </footer>
    </div>
  );
}