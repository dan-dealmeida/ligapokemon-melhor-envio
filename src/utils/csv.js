import { SERVICES } from '../constants/shipping';
import { cleanDoc, cleanCep, parsePrice } from './validators';

// Analisa o texto da coluna MODALIDADE ou FORMA DE ENVIO
export const detectShippingService = (shippingText) => {
  if (!shippingText) return 17; // Padrão para cartas Pokémon TCG (Mini Envios)

  const text = shippingText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

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

export const parseCSVOrders = (content) => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return { orders: [], error: 'O arquivo CSV parece estar vazio ou não tem cabeçalho.' };
  }

  // Detect separator: ';' or ','
  const headerLine = lines[0];
  const separator =
    (headerLine.match(/;/g) || []).length >= (headerLine.match(/,/g) || []).length ? ';' : ',';

  const rawHeaders = headerLine
    .split(separator)
    .map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

  const findIndex = (...candidates) => {
    return rawHeaders.findIndex((h) => candidates.some((c) => h.includes(c.toLowerCase())));
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
    const row = lines[i].split(separator).map((val) => val.trim().replace(/^["']|["']$/g, ''));
    if (row.length < 2) continue;

    const orderId = idIdx !== -1 && row[idIdx] ? row[idIdx] : `#PED-${1000 + i}`;
    const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : `Cliente ${i}`;
    const document = docIdx !== -1 && row[docIdx] ? row[docIdx] : '';
    const phone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx] : '';
    const cep = cepIdx !== -1 && row[cepIdx] ? row[cepIdx] : '';
    const address = addressIdx !== -1 && row[addressIdx] ? row[addressIdx] : '';
    const number = numberIdx !== -1 && row[numberIdx] ? row[numberIdx] : 'S/N';
    const rawComplement = compIdx !== -1 && row[compIdx] ? row[compIdx].trim() : '';
    const complement =
      rawComplement === 'null' || rawComplement === 'undefined' ? '' : rawComplement;
    const district = districtIdx !== -1 && row[districtIdx] ? row[districtIdx] : 'Centro';
    const city = cityIdx !== -1 && row[cityIdx] ? row[cityIdx] : '';
    const uf = ufIdx !== -1 && row[ufIdx] ? row[ufIdx].toUpperCase().substring(0, 2) : 'SP';
    const rawShippingMethod = shippingIdx !== -1 && row[shippingIdx] ? row[shippingIdx] : '';
    const detectedServiceId = detectShippingService(rawShippingMethod);
    const email = emailIdx !== -1 && row[emailIdx] ? row[emailIdx].trim() : '';

    // Verifica se é retirada no local
    const isPickup =
      rawShippingMethod.toLowerCase().includes('balcao') ||
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
      shipping_method_original: rawShippingMethod,
      service_id: detectedServiceId,
      is_pickup: isPickup,
      status: isPickup ? 'error' : 'pending',
      error_msg: isPickup ? 'Pedido marcado como "Retirar no balcão"' : null,
      cart_id: null,
    });
  }

  if (parsed.length === 0) {
    return { orders: [], error: 'Nenhum pedido pôde ser extraído do arquivo.' };
  }

  return { orders: parsed, error: null };
};

export const exportMelhorEnvioCSV = ({ orders, sender, packageSettings }) => {
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
    'Informações Adicionais / Pedido',
  ];

  const rows = orders.map((order) => {
    const srv = SERVICES.find((s) => s.id === order.service_id) || SERVICES[0];
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
      `"Pedido LigaPokemon ${order.id}"`,
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `melhor_envio_lote_ligapokemon_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
