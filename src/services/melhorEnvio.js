import { cleanDoc, cleanCep } from '../utils/validators';

export const buildMelhorEnvioPayload = (order, sender, packageSettings) => {
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
      postal_code: cleanFromCep,
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
      note: `Pedido Liga: ${order.id}`,
    },
    // OBRIGATÓRIO quando non_commercial: true (Declaração de Conteúdo)
    products: [
      {
        name: `Cartas Pokémon TCG - Pedido ${order.id}`,
        quantity: 1,
        unitary_value: Math.max(Number(order.value) || 20, 1),
      },
    ],
    package: {
      height: Number(packageSettings.height) || 2,
      width: Number(packageSettings.width) || 11,
      length: Number(packageSettings.length) || 16,
      weight: Number(packageSettings.weight) || 0.1,
    },
    options: {
      insurance_value: Math.min(Math.max(Number(order.value) || 20, 20), 5000),
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: true,
    },
  };
};

export const pushOrderToCart = async ({ baseUrl, apiToken, payload }) => {
  // If no token or demo token provided, provide instant realistic simulation
  if (!apiToken || apiToken.trim().length < 15 || apiToken === 'demo_token') {
    await new Promise((r) => setTimeout(r, 600));
    const simulatedCartId = 'sim_' + Math.random().toString(36).substring(2, 9);
    return {
      ok: true,
      simulated: true,
      cartId: simulatedCartId,
    };
  }

  const response = await fetch(`${baseUrl}/me/cart`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken.trim()}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (response.ok) {
    return {
      ok: true,
      simulated: false,
      cartId: data.id || 'OK',
    };
  }

  const errorDetail = data?.message || data?.error || JSON.stringify(data);
  return {
    ok: false,
    errorDetail,
  };
};

